# Automated video pipeline

One HTTP call turns a question in the knowledge graph into a complete production
package: a researched, cited, shot-by-shot script, narration audio, a keyframe
per shot and an animated clip per shot. Nothing is published — every run lands as
a new `infi_revision` on a **draft** documentary for an editor to promote.

```
POST /api/video/generate
        │
        ▼
  infi_video_job  ── queued ──▶  worker tick ──▶ brief ─▶ script ─▶ narration ─▶ keyframes ─▶ clips ─▶ done
                                     ▲                │           │             │            │
                                     └── resumable ───┴───────────┴─────────────┴────────────┘
```

## Endpoints

All three require the shared secret in `x-infinarad-token` (or
`Authorization: Bearer …`). With `VIDEO_PIPELINE_TOKEN` unset they answer `503`
rather than running unauthenticated.

### `POST /api/video/generate`

Queues one documentary and returns immediately — no model or provider is called
in the request path.

```bash
curl -X POST https://infinarad.com/api/video/generate \
  -H "x-infinarad-token: $VIDEO_PIPELINE_TOKEN" \
  -H "content-type: application/json" \
  -d '{
        "question": "what-happens-after-death",
        "tradition": "buddhism",
        "locale": "es",
        "params": { "durationSec": 180, "aspect": "landscape" }
      }'
```

| Field | Default | Meaning |
|---|---|---|
| `question` | — | Question slug (a search term also resolves). |
| `tradition` | `null` | Tradition slug. Omitted ⇒ a comparative, all-traditions angle. |
| `locale` | `en` | Narration language; one of the ten site locales. |
| `angle` | tradition slug | Angle identifier on `infi_documentary`. |
| `force` | `false` | Queue a new run even if this angle already has a job. |
| `params.durationSec` | `180` | Target runtime, 30–1200 s. |
| `params.shotSeconds` | `5` | Seconds per generated clip. |
| `params.aspect` | `landscape` | `landscape` \| `portrait` \| `square`. |
| `params.quality` | `1080p` | Keyframe quality. |
| `params.dopModel` | `dop-turbo` | `dop-lite` \| `dop-turbo` \| `dop-standard`. |
| `params.visualStyle` | house style | Overrides the art direction sent to the image model. |
| `params.voiceId` | `ELEVENLABS_VOICE_ID` | Narration voice. |
| `params.seed` | random | Makes keyframes reproducible across re-runs. |
| `params.dryRun` | `false` | Writes the script, calls no media provider. |
| `params.skipNarration` / `skipKeyframes` / `skipClips` | `false` | Stage switches. |

Responses: `202` with a `job_id` and `status_url`, `200` when the angle already
has a job, `404` when the question or tradition is not published, `401`/`503` for
auth.

### `GET /api/video/jobs/{id}`

Full state of one run: stage, per-shot assets with their URLs, the accepted
script, and the last 50 log lines.

### `POST /api/video/worker`

Advances queued jobs for one bounded tick. `?budgetMs=20000&maxJobs=3`.

## Running the worker

Every tick is resumable, so a tick killed by a platform timeout costs nothing —
the next one continues from the last persisted step. Pick one trigger:

- **Netlify scheduled function** (default): `netlify/functions/video-worker.mts`
  fires every 5 minutes and pokes `/api/video/worker`. It holds no pipeline
  logic, so it stays well inside Netlify's synchronous budget.
- **GitHub Actions**: `.github/workflows/video-worker.yml`, every 10 minutes with
  a 10-minute budget. Enable it with the repo variable
  `VIDEO_WORKER_ENABLED=true` and the secrets the workflow lists. Use this when
  you want long ticks — the script stage is a single Claude call that can outlast
  a serverless timeout, and a long tick finishes a whole job in one go.
- **Locally**: `pnpm video:worker` (watch loop) or `pnpm video work --once`.

## CLI

```bash
pnpm video enqueue -q what-happens-after-death -t buddhism -l es --duration 180
pnpm video enqueue -q suffering --dry-run          # script only, no provider calls
pnpm video work --once --budget-ms 600000          # one long tick
pnpm video work --watch                            # keep working
pnpm video status vjb_01M0…                        # stage, assets, log
```

## The stages

| Stage | What happens | Fails when |
|---|---|---|
| `brief` | Pulls the question, tradition, concepts, authors, works, practices, symbols and citations from the graph. This is the **only** knowledge the writer may use. | The question has no approved concept edges. |
| `script` | One Claude call (`claude-opus-5`, structured output) writes the whole script. It is validated, and validation errors are fed back for a rewrite — up to `VIDEO_MAX_ATTEMPTS` drafts. The accepted script becomes an `infi_revision` plus one `infi_video_shot` row per shot. | Three drafts in a row fail validation. |
| `narration` | ElevenLabs synthesises each shot's line; audio goes to Supabase Storage (or the Higgsfield CDN). | Skipped, not failed, when no voice key is configured. |
| `keyframes` | Higgsfield `text2image/soul` renders one still per shot. Submissions and collections happen on different ticks. | The provider rejects the prompt (4xx). |
| `clips` | Higgsfield `image2video/dop` animates each keyframe with that shot's motion prompt. | Same. |
| `done` | Counts assets, marks the job `succeeded` (or `failed` if any asset failed — the rest are still stored). | — |

## What the script guarantees

Validation rejects a draft that:

- cites a citation id that is not in the brief;
- asserts a fact with no citation while the brief has citable sources;
- writes narration too long to read inside its shot;
- points a shot at a chapter that does not exist, repeats narration, or skips a
  shot index;
- lands more than 25 % away from the requested runtime.

When the question has **no** published citations, claims are allowed but the run
is flagged `needs_sources` in the job log — an editor has to source them before
the documentary can be published.

## Editorial safety

- Nothing is published. The documentary row stays `draft`; the pipeline only
  points a **draft** documentary at its newest revision, never a published one.
- Every run appends a revision — earlier drafts are never overwritten.
- The pipeline tables carry RLS: no anonymous access, staff read, admin/editor
  write.
- The endpoints are machine-facing and secret-gated; they are not part of the
  public site.

## Cost control

A 180-second film is ~36 shots: 36 keyframes + 36 clips + 36 narration lines,
plus one Claude call. Rehearse with `params.dryRun` (script only), then
`skipClips` (script + stills) before spending on clips.
