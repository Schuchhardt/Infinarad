import type { RelatedTradition } from "@/lib/questions";
import { SectionHeading } from "./section-heading";

interface TraditionsSectionProps {
  traditions: RelatedTradition[];
  title: string;
}

const ICON = (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="#C6A66B" strokeWidth="1.1">
    <circle cx="6" cy="8" r="4.4"/><circle cx="10" cy="8" r="4.4"/>
  </svg>
);

export function TraditionsSection({ traditions, title }: TraditionsSectionProps) {
  if (traditions.length === 0) return null;

  return (
    <section id="s2" className="scroll-mt-[84px] mt-[68px]" aria-labelledby="traditions-heading">
      <SectionHeading id="traditions-heading" title={title} count={traditions.length} icon={ICON} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {traditions.map((t) => (
          <div
            key={t.id}
            className="border border-border p-6 flex flex-col gap-[10px] transition-colors hover:border-gold/35"
            style={{ background: "rgba(9,11,15,0.6)" }}
          >
            <span className="font-display text-[21px] leading-[1.2]">{t.name}</span>
            {t.collection_name && (
              <span className="text-[9.5px] font-medium tracking-[0.14em] uppercase text-gold/60">
                {t.collection_name}
              </span>
            )}
            {t.summary && (
              <span className="text-[13px] leading-[1.7] text-muted">{t.summary}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
