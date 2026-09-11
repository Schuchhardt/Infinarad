-- 0011_video_pipeline.sql
-- Automated video pipeline: jobs, shots, generated assets and an audit trail.
--
-- A job is one run of the pipeline for a (question, angle, locale) triple. It
-- walks a stage machine — brief -> script -> narration -> keyframes -> clips ->
-- done — and every stage is resumable: the worker can die at any point and the
-- next tick picks the job up where it left off.
--
-- Nothing here publishes. The script lands as a new infi_revision and the
-- documentary stays in 'draft' until an editor promotes it.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_video_job_status') THEN
    CREATE TYPE infi_video_job_status AS ENUM ('queued','running','waiting','succeeded','failed','canceled');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_video_stage') THEN
    CREATE TYPE infi_video_stage AS ENUM ('brief','script','narration','keyframes','clips','done');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_video_asset_kind') THEN
    CREATE TYPE infi_video_asset_kind AS ENUM ('narration','keyframe','clip','thumbnail');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'infi_video_asset_status') THEN
    CREATE TYPE infi_video_asset_status AS ENUM ('pending','submitted','ready','failed','skipped');
  END IF;
END $$;

CREATE TABLE infi_video_job (
  id                 text PRIMARY KEY DEFAULT infi_gen_prefixed_id('vjb'),
  question_id        text NOT NULL REFERENCES infi_question(id),
  tradition_id       text REFERENCES infi_tradition(id),
  documentary_id     text REFERENCES infi_documentary(id),
  angle_slug         text NOT NULL,
  locale             text NOT NULL REFERENCES infi_locale(code),
  status             infi_video_job_status NOT NULL DEFAULT 'queued',
  stage              infi_video_stage NOT NULL DEFAULT 'brief',
  params             jsonb NOT NULL DEFAULT '{}'::jsonb,
  brief              jsonb,
  script_revision_id text REFERENCES infi_revision(id),
  idempotency_key    text NOT NULL UNIQUE,
  requested_by       text,
  -- attempt counts failures of the CURRENT stage; reset on every stage change.
  attempt            int NOT NULL DEFAULT 0,
  -- Validation findings handed back to the writer for the next draft. Kept
  -- apart from `error` so an infrastructure failure is never mistaken for an
  -- editorial correction.
  repair_notes       text[],
  -- A worker holds a job by pushing lease_until into the future. An expired
  -- lease means the worker died; any other worker may reclaim the job.
  lease_until        timestamptz,
  error              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  started_at         timestamptz,
  finished_at        timestamptz
);

-- The worker's claim query: open jobs ordered by age.
CREATE INDEX infi_video_job_claimable ON infi_video_job (created_at)
  WHERE status IN ('queued','running','waiting');
CREATE INDEX infi_video_job_question ON infi_video_job (question_id, locale);

CREATE TABLE infi_video_shot (
  id             text PRIMARY KEY DEFAULT infi_gen_prefixed_id('vsh'),
  job_id         text NOT NULL REFERENCES infi_video_job(id) ON DELETE CASCADE,
  idx            int NOT NULL,
  chapter_slug   text NOT NULL,
  duration_sec   numeric(5,2) NOT NULL,
  narration      text NOT NULL,
  on_screen_text text,
  image_prompt   text NOT NULL,
  motion_prompt  text NOT NULL,
  camera         text,
  transition     text,
  claim_text     text,
  citation_ids   text[] NOT NULL DEFAULT '{}',
  body           jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, idx)
);

CREATE TABLE infi_video_asset (
  id                text PRIMARY KEY DEFAULT infi_gen_prefixed_id('vas'),
  job_id            text NOT NULL REFERENCES infi_video_job(id) ON DELETE CASCADE,
  shot_id           text REFERENCES infi_video_shot(id) ON DELETE CASCADE,
  kind              infi_video_asset_kind NOT NULL,
  status            infi_video_asset_status NOT NULL DEFAULT 'pending',
  provider          text NOT NULL,
  provider_endpoint text,
  provider_job_id   text,
  url               text,
  duration_sec      numeric(5,2),
  attempt           int NOT NULL DEFAULT 0,
  error             text,
  meta              jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- One asset per (shot, kind); job-level assets (thumbnail) are unique per job.
CREATE UNIQUE INDEX infi_video_asset_per_shot ON infi_video_asset (shot_id, kind)
  WHERE shot_id IS NOT NULL;
CREATE UNIQUE INDEX infi_video_asset_per_job ON infi_video_asset (job_id, kind)
  WHERE shot_id IS NULL;
CREATE INDEX infi_video_asset_pending ON infi_video_asset (job_id, kind, status);

CREATE TABLE infi_video_job_event (
  id         text PRIMARY KEY DEFAULT infi_gen_prefixed_id('vev'),
  job_id     text NOT NULL REFERENCES infi_video_job(id) ON DELETE CASCADE,
  stage      infi_video_stage NOT NULL,
  level      text NOT NULL DEFAULT 'info',
  message    text NOT NULL,
  data       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX infi_video_job_event_job ON infi_video_job_event (job_id, created_at);

CREATE OR REPLACE FUNCTION infi_video_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $fn$ BEGIN NEW.updated_at := now(); RETURN NEW; END $fn$;

CREATE TRIGGER infi_video_job_touch BEFORE UPDATE ON infi_video_job
  FOR EACH ROW EXECUTE FUNCTION infi_video_touch_updated_at();
CREATE TRIGGER infi_video_asset_touch BEFORE UPDATE ON infi_video_asset
  FOR EACH ROW EXECUTE FUNCTION infi_video_touch_updated_at();

-- ===== RLS =====
-- Production runs the pipeline with the owning role (RLS is bypassed there).
-- For anon and authenticated the pipeline is staff-only: no anonymous access at
-- all, staff read, admin/editor write.
ALTER TABLE infi_video_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_video_shot ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_video_asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE infi_video_job_event ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_read_video_job ON infi_video_job
  FOR SELECT USING (false);
CREATE POLICY public_read_video_shot ON infi_video_shot
  FOR SELECT USING (false);
CREATE POLICY public_read_video_asset ON infi_video_asset
  FOR SELECT USING (false);
CREATE POLICY public_read_video_job_event ON infi_video_job_event
  FOR SELECT USING (false);

CREATE POLICY staff_read_video_job ON infi_video_job
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));
CREATE POLICY staff_read_video_shot ON infi_video_shot
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));
CREATE POLICY staff_read_video_asset ON infi_video_asset
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));
CREATE POLICY staff_read_video_job_event ON infi_video_job_event
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role <> 'viewer'));

CREATE POLICY staff_write_video_job ON infi_video_job
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin','editor')));
CREATE POLICY staff_write_video_shot ON infi_video_shot
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin','editor')));
CREATE POLICY staff_write_video_asset ON infi_video_asset
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin','editor')));
CREATE POLICY staff_write_video_job_event ON infi_video_job_event
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM infi_profile p WHERE p.id = auth.uid() AND p.role IN ('admin','editor')));

-- Grants stay scoped to infi_* objects: this schema is shared with other projects.
-- anon gets nothing: the pipeline is internal.
GRANT SELECT, INSERT, UPDATE, DELETE ON
  infi_video_job, infi_video_shot, infi_video_asset, infi_video_job_event
TO authenticated;
