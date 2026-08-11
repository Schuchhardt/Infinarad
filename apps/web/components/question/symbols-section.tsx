import type { RelatedSymbol } from "@/lib/questions";
import { SectionHeading } from "./section-heading";

interface SymbolsSectionProps {
  symbols: RelatedSymbol[];
  title: string;
}

const ICON = (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="#C6A66B" strokeWidth="1.1">
    <path d="M8 1l1.8 4.2H15l-3.8 3 1.6 4.8L8 10.2 3.2 13l1.6-4.8L1 5.2h5.2z"/>
  </svg>
);

export function SymbolsSection({ symbols, title }: SymbolsSectionProps) {
  if (symbols.length === 0) return null;

  return (
    <section id="s6" className="scroll-mt-[84px] mt-[68px]" aria-labelledby="symbols-heading">
      <SectionHeading id="symbols-heading" title={title} count={symbols.length} icon={ICON} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-border" style={{ gap: "1px", background: "#232D39" }}>
        {symbols.map((s) => (
          <div
            key={s.id}
            className="bg-background p-[22px_24px] flex flex-col items-center gap-3 text-center transition-colors hover:bg-surface"
          >
            {s.unicode_char && (
              <span className="text-[42px] leading-none" role="img" aria-label={s.name}>
                {s.unicode_char}
              </span>
            )}
            <span
              className="font-display text-[19px]"
              lang={s.is_fallback ? "en" : undefined}
            >
              {s.name}
            </span>
            {s.tradition_name && (
              <span className="text-[9.5px] font-medium tracking-[0.14em] uppercase text-gold/60">
                {s.tradition_name}
              </span>
            )}
            {s.summary && (
              <span className="text-[13px] leading-[1.7] text-muted">{s.summary}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
