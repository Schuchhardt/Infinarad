#!/usr/bin/env tsx
/**
 * Video pipeline CLI — the same code path the HTTP endpoints use.
 *
 * Usage:
 *   pnpm video enqueue -q what-happens-after-death -t buddhism -l es
 *   pnpm video work --watch          # run the worker until interrupted
 *   pnpm video work --once           # one tick, then exit (for cron / CI)
 *   pnpm video status vjb_...
 */

import { sql } from "../packages/db/src/connection.js";
import {
  drainJobs,
  enqueueJob,
  getJobReport,
} from "../packages/video/src/index.js";
import type { JobParams } from "../packages/video/src/index.js";

function arg(flags: string[], fallback?: string): string | undefined {
  const args = process.argv.slice(3);
  for (let i = 0; i < args.length; i += 1) {
    if (flags.includes(args[i] ?? "")) return args[i + 1];
  }
  return fallback;
}

function flag(name: string): boolean {
  return process.argv.slice(3).includes(name);
}

function usage(): never {
  console.log(`
Video pipeline CLI

  pnpm video enqueue -q <question-slug> [-t <tradition-slug>] [-l <locale>]
                     [--duration 180] [--shot-seconds 5] [--aspect landscape]
                     [--dry-run] [--skip-narration] [--force]
  pnpm video work [--once] [--watch] [--budget-ms 60000] [--max-jobs 3] [--interval 15]
  pnpm video status <job-id>
`);
  process.exit(1);
}

async function enqueue(): Promise<void> {
  const question = arg(["-q", "--question"]);
  if (!question) usage();

  const params: Partial<JobParams> = {};
  const duration = arg(["--duration"]);
  if (duration) params.durationSec = Number(duration);
  const shotSeconds = arg(["--shot-seconds"]);
  if (shotSeconds) params.shotSeconds = Number(shotSeconds);
  const aspect = arg(["--aspect"]);
  if (aspect) params.aspect = aspect as JobParams["aspect"];
  if (flag("--dry-run")) params.dryRun = true;
  if (flag("--skip-narration")) params.skipNarration = true;

  const tradition = arg(["-t", "--tradition"]);
  const { job, created } = await enqueueJob({
    questionSlug: question,
    traditionSlug: tradition ?? null,
    locale: arg(["-l", "--locale"], "en") ?? "en",
    params,
    force: flag("--force"),
    requestedBy: "cli",
  });

  console.log(created ? `  queued ${job.id}` : `  existing job ${job.id}`);
  console.log(`  angle: ${job.angle_slug}  locale: ${job.locale}  stage: ${job.stage}`);
  console.log(`  follow: pnpm video status ${job.id}`);
}

async function work(): Promise<void> {
  const budgetMs = Number(arg(["--budget-ms"], "60000"));
  const maxJobs = Number(arg(["--max-jobs"], "3"));
  const intervalSec = Number(arg(["--interval"], "15"));
  const watch = flag("--watch");

  do {
    const report = await drainJobs({ budgetMs, maxJobs });
    if (report.steps.length > 0 || report.claimed > 0) {
      console.log(
        `  tick: claimed ${report.claimed}, ${report.steps.length} steps in ${report.elapsedMs}ms`,
      );
      for (const step of report.steps) {
        console.log(`    ${step.jobId} → ${step.stage}: ${step.note}`);
      }
    }
    if (watch) {
      await new Promise((resolve) => setTimeout(resolve, intervalSec * 1000));
    }
  } while (watch);
}

async function status(): Promise<void> {
  const jobId = process.argv[3];
  if (!jobId) usage();

  const report = await getJobReport(jobId);
  if (!report) {
    console.error(`  no job ${jobId}`);
    process.exit(1);
  }

  console.log(`\n  ${report.job.id}  ${report.job.status} / ${report.job.stage}`);
  console.log(`  angle: ${report.job.angle_slug}  locale: ${report.job.locale}`);
  if (report.job.error) console.log(`  error: ${report.job.error}`);
  if (report.script) {
    console.log(`\n  "${report.script.title}" — ${report.script.shots.length} shots`);
    console.log(`  hook: ${report.script.hook}`);
  }
  if (report.assets.length > 0) {
    console.log("\n  ASSETS");
    for (const row of report.assets) {
      console.log(`    ${row.kind.padEnd(10)} ${row.status.padEnd(10)} ${row.count}`);
    }
  }
  console.log("\n  LOG");
  for (const event of report.events.slice(0, 15).reverse()) {
    console.log(`    ${event.level.padEnd(5)} ${event.stage.padEnd(10)} ${event.message}`);
  }
  console.log("");
}

async function main(): Promise<void> {
  const command = process.argv[2];
  try {
    switch (command) {
      case "enqueue":
        await enqueue();
        break;
      case "work":
        await work();
        break;
      case "status":
        await status();
        break;
      default:
        usage();
    }
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
