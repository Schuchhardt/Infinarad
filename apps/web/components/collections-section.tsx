import type { CollectionData } from "@/lib/data";
import { ScrollReveal } from "@/components/scroll-reveal";

interface CollectionsSectionProps {
  collections: CollectionData[];
  sectionTitle: string;
  locale: string;
}

const COLLECTION_ICONS: Record<string, string> = {
  col_DHARMIC: "ॐ",
  col_ABRAHAMIC: "☽",
  col_CLASSICAL: "⚡",
  col_EAST_ASIAN: "☯",
  col_INDIGENOUS: "🌿",
  col_MODERN: "🔬",
};

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
    <section className="section-container py-28" aria-labelledby="collections-heading">
      <ScrollReveal>
        <p
          id="collections-heading"
          className="mb-16 text-sm font-medium tracking-[0.3em] uppercase text-gold"
        >
          {sectionTitle}
        </p>
      </ScrollReveal>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((col, i) => (
          <ScrollReveal key={col.id} stagger={Math.min(i + 1, 5)}>
            <div className="group rounded-[20px] border border-border bg-card p-10 transition-all duration-500 hover:-translate-y-0.5 hover:border-gold/30">
              <p className="mb-5 text-3xl" aria-hidden="true">
                {COLLECTION_ICONS[col.id] ?? "◈"}
              </p>
              <h3 className="font-display text-xl font-medium tracking-[0.04em] text-text md:text-2xl">
                {col.name}
              </h3>
              <p className="mt-3 text-xs tracking-wider text-muted">
                {pluralizeTraditions(col.tradition_count, locale)}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
