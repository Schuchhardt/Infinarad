import type { RelatedPractice } from "@/lib/questions";
import { SectionHeading } from "./section-heading";

interface PracticesSectionProps {
  practices: RelatedPractice[];
  title: string;
}

const ICON = (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="#C6A66B" strokeWidth="1.1">
    <circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2.4"/>
  </svg>
);

export function PracticesSection({ practices, title }: PracticesSectionProps) {
  if (practices.length === 0) return null;

  return (
    <section id="s5" className="scroll-mt-[84px] mt-[68px]" aria-labelledby="practices-heading">
      <SectionHeading id="practices-heading" title={title} count={practices.length} icon={ICON} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {practices.map((p) => (
          <div
            key={p.id}
            className="border border-border p-[20px_22px] flex flex-col gap-[7px]"
          >
            <span className="font-display text-[19px]">{p.name}</span>
            {p.tradition_name && (
              <span className="text-[9.5px] font-medium tracking-[0.14em] uppercase text-gold/60">
                {p.tradition_name}
              </span>
            )}
            {p.summary && (
              <span className="text-[13px] leading-[1.7] text-muted">{p.summary}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
