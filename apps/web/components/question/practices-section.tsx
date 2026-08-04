import type { RelatedPractice } from "@/lib/questions";
import { SectionHeading } from "./section-heading";

interface PracticesSectionProps {
  practices: RelatedPractice[];
  title: string;
}

export function PracticesSection({ practices, title }: PracticesSectionProps) {
  if (practices.length === 0) return null;

  return (
    <section className="px-6 py-16" aria-labelledby="practices-heading">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          id="practices-heading"
          title={title}
          count={practices.length}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {practices.map((p) => (
            <div
              key={p.id}
              className="rounded-sm border border-border bg-surface/50 p-6 transition-colors hover:border-gold/30"
            >
              <h3
                className="font-display text-lg text-text"
                lang={p.is_fallback ? "en" : undefined}
              >
                {p.name}
              </h3>
              {p.tradition_name && (
                <span className="mt-1 inline-block text-[0.65rem] font-medium uppercase tracking-wider text-accent/80">
                  {p.tradition_name}
                </span>
              )}
              {p.summary && (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {p.summary}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
