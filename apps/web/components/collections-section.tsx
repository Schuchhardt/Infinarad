import type { CollectionData } from "@/lib/data";
import { ScrollReveal } from "@/components/scroll-reveal";

interface CollectionsSectionProps {
  collections: CollectionData[];
  sectionTitle: string;
  locale: string;
}

function pluralizeTraditions(count: number, locale: string): string {
  const labels: Record<string, [string, string]> = {
    en: ["tradition", "traditions"],
    es: ["tradición", "tradiciones"],
    pt: ["tradição", "tradições"],
    fr: ["tradition", "traditions"],
    de: ["Tradition", "Traditionen"],
    ar: ["تقليد", "تقاليد"],
    hi: ["परंपरा", "परंपराएँ"],
    zh: ["个传统", "个传统"],
    ja: ["つの伝統", "つの伝統"],
    he: ["מסורת", "מסורות"],
  };
  const [singular, plural] = labels[locale] ?? labels["en"]!;
  return `${count} ${count === 1 ? singular : plural}`;
}

export function CollectionsSection({
  collections,
  sectionTitle,
  locale,
}: CollectionsSectionProps) {
  return (
    <section className="section-container pb-[100px]" aria-labelledby="collections-heading">
      <ScrollReveal>
        <p
          id="collections-heading"
          className="mb-9 flex items-center gap-[10px] text-xs font-medium tracking-[0.3em] uppercase text-gold"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#C6A66B" strokeWidth="1.1">
            <rect x="2.2" y="2.2" width="5" height="5"/>
            <rect x="8.8" y="2.2" width="5" height="5"/>
            <rect x="2.2" y="8.8" width="5" height="5"/>
            <rect x="8.8" y="8.8" width="5" height="5"/>
          </svg>
          {sectionTitle}
        </p>
      </ScrollReveal>

      <div
        className="grid grid-cols-2 lg:grid-cols-4 border border-border"
        style={{ gap: "1px", background: "#232D39" }}
      >
        {collections.map((col, i) => (
          <ScrollReveal key={col.id} stagger={Math.min(i + 1, 5)}>
            <div className="bg-background p-6 flex flex-col gap-[10px] cursor-pointer transition-colors hover:bg-surface">
              <div className="w-[26px] h-[26px] rounded-full border border-gold/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gold/50" />
              </div>
              <span className="font-display text-[22px] leading-[1.2]">
                {col.name}
              </span>
              <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-dim">
                {pluralizeTraditions(col.tradition_count, locale)}
              </span>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
