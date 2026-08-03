import type { RelatedSymbol } from "@/lib/questions";
import { SectionHeading } from "./section-heading";

interface SymbolsSectionProps {
  symbols: RelatedSymbol[];
  title: string;
}

export function SymbolsSection({ symbols, title }: SymbolsSectionProps) {
  if (symbols.length === 0) return null;

  return (
    <section
      className="bg-lapis/10 px-6 py-16"
      aria-labelledby="symbols-heading"
    >
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          id="symbols-heading"
          title={title}
          count={symbols.length}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {symbols.map((s) => (
            <div
              key={s.id}
              className="rounded-sm border border-parchment/8 bg-ink/60 p-6 text-center transition-colors hover:border-gold/30"
            >
              {s.unicode_char && (
                <span
                  className="mb-3 block text-4xl"
                  role="img"
                  aria-label={s.name}
                >
                  {s.unicode_char}
                </span>
              )}
              <h3
                className="font-display text-lg text-parchment"
                lang={s.is_fallback ? "en" : undefined}
              >
                {s.name}
              </h3>
              {s.tradition_name && (
                <span className="mt-1 inline-block font-mono text-[0.65rem] uppercase tracking-wider text-gold/60">
                  {s.tradition_name}
                </span>
              )}
              {s.summary && (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {s.summary}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
