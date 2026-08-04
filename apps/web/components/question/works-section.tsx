import type { RelatedWork } from "@/lib/questions";
import { SectionHeading } from "./section-heading";

interface WorksSectionProps {
  works: RelatedWork[];
  title: string;
}

function formatComposed(start: number | null, end: number | null): string {
  if (!start) return "";
  const s = start < 0 ? `${Math.abs(start)} BCE` : `${start} CE`;
  if (!end || end === start) return `c. ${s}`;
  const e = end < 0 ? `${Math.abs(end)} BCE` : `${end} CE`;
  return `${s} – ${e}`;
}

export function WorksSection({ works, title }: WorksSectionProps) {
  if (works.length === 0) return null;

  return (
    <section
      className="bg-accent/10 px-6 py-16"
      aria-labelledby="works-heading"
    >
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          id="works-heading"
          title={title}
          count={works.length}
        />
        <div className="space-y-6">
          {works.map((w) => (
            <div
              key={w.id}
              className="flex items-baseline gap-6 border-b border-border pb-6 last:border-0"
            >
              <div className="flex-1">
                <h3
                  className="font-display text-lg text-text italic"
                  lang={w.is_fallback ? "en" : undefined}
                >
                  {w.name}
                </h3>
                {w.author_name && (
                  <span className="mt-1 block text-sm text-muted">
                    {w.author_name}
                  </span>
                )}
                {w.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-muted/80">
                    {w.summary}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-end">
                {w.original_language && (
                  <span className="block text-[0.65rem] font-medium uppercase tracking-wider text-accent/60">
                    {w.original_language}
                  </span>
                )}
                {(w.composed_start || w.composed_end) && (
                  <span className="block text-xs font-medium text-muted/50">
                    {formatComposed(w.composed_start, w.composed_end)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
