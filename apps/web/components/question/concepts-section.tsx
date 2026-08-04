import type { RelatedConcept } from "@/lib/questions";
import { SectionHeading } from "./section-heading";

interface ConceptsSectionProps {
  concepts: RelatedConcept[];
  title: string;
}

export function ConceptsSection({ concepts, title }: ConceptsSectionProps) {
  if (concepts.length === 0) return null;

  return (
    <section className="px-6 py-16" aria-labelledby="concepts-heading">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          id="concepts-heading"
          title={title}
          count={concepts.length}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {concepts.map((c) => (
            <div
              key={c.id}
              className="rounded-sm border border-border bg-surface/50 p-6 transition-colors hover:border-gold/30"
            >
              <div className="mb-3 flex items-baseline gap-3">
                {c.original_script && (
                  <span className="font-display text-2xl text-gold/80">
                    {c.original_script}
                  </span>
                )}
                <div>
                  <h3
                    className="font-display text-lg text-text"
                    lang={c.is_fallback ? "en" : undefined}
                  >
                    {c.name}
                  </h3>
                  {c.transliteration && (
                    <span className="text-xs font-medium text-muted/60 italic">
                      {c.transliteration}
                    </span>
                  )}
                </div>
              </div>
              {c.summary && (
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {c.summary}
                </p>
              )}
              {c.tradition_name && (
                <span className="mt-3 inline-block text-[0.65rem] font-medium uppercase tracking-wider text-accent/80">
                  {c.tradition_name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
