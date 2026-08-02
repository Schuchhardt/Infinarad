import type { CollectionData } from "@/lib/data";

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
    <section className="px-6 py-32" aria-labelledby="collections-heading">
      <div className="mx-auto max-w-4xl">
        <p
          id="collections-heading"
          className="mb-20 font-mono text-xs tracking-[0.3em] uppercase text-gold"
        >
          {sectionTitle}
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <div
              key={col.id}
              className="group rounded-sm border border-parchment/8 bg-ink-light/50 p-6 transition-colors hover:border-gold/30"
            >
              <h3 className="font-display text-lg text-parchment">
                {col.name}
              </h3>
              <p className="mt-2 font-mono text-xs text-muted">
                {pluralizeTraditions(col.tradition_count, locale)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
