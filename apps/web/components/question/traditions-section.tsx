import type { RelatedTradition } from "@/lib/questions";
import { SectionHeading } from "./section-heading";

interface TraditionsSectionProps {
  traditions: RelatedTradition[];
  title: string;
}

export function TraditionsSection({
  traditions,
  title,
}: TraditionsSectionProps) {
  if (traditions.length === 0) return null;

  return (
    <section
      className="bg-accent/10 px-6 py-16"
      aria-labelledby="traditions-heading"
    >
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          id="traditions-heading"
          title={title}
          count={traditions.length}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {traditions.map((t) => (
            <div
              key={t.id}
              className="rounded-sm border border-border bg-background/60 p-6 transition-colors hover:border-gold/30"
            >
              <h3
                className="font-display text-lg text-text"
                lang={t.is_fallback ? "en" : undefined}
              >
                {t.name}
              </h3>
              {t.collection_name && (
                <span className="mt-1 inline-block text-[0.65rem] font-medium uppercase tracking-wider text-gold/60">
                  {t.collection_name}
                </span>
              )}
              {t.summary && (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t.summary}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
