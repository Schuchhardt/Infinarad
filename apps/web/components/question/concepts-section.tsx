import type { RelatedConcept } from "@/lib/questions";
import { SectionHeading } from "./section-heading";

interface ConceptsSectionProps {
  concepts: RelatedConcept[];
  title: string;
}

const ICON = (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="#C6A66B" strokeWidth="1.1">
    <path d="M8 1.8 14.2 8 8 14.2 1.8 8z"/>
  </svg>
);

export function ConceptsSection({ concepts, title }: ConceptsSectionProps) {
  if (concepts.length === 0) return null;

  return (
    <section id="s1" className="scroll-mt-[84px]" aria-labelledby="concepts-heading">
      <SectionHeading id="concepts-heading" title={title} count={concepts.length} icon={ICON} />
      <div className="grid grid-cols-1 sm:grid-cols-2 border border-border" style={{ gap: "1px", background: "#232D39" }}>
        {concepts.map((c) => (
          <div
            key={c.id}
            className="bg-background p-[22px_24px] flex flex-col gap-2 transition-colors hover:bg-surface"
          >
            <div className="flex items-baseline gap-[10px] flex-wrap">
              <span className="font-display text-xl">{c.name}</span>
              {c.original_script && (
                <span className="font-display text-[17px] text-gold">{c.original_script}</span>
              )}
              {c.transliteration && (
                <span className="text-[11px] italic text-dim">{c.transliteration}</span>
              )}
            </div>
            {c.summary && (
              <span className="text-[13.5px] leading-[1.7] text-muted">{c.summary}</span>
            )}
            {c.tradition_name && (
              <span className="text-[9.5px] font-medium tracking-[0.12em] uppercase text-gold/60 mt-0.5">
                {c.tradition_name}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
