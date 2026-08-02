import type { CollectionData } from "@/lib/data";

interface CollectionsSectionProps {
  collections: CollectionData[];
  sectionTitle: string;
}

export function CollectionsSection({
  collections,
  sectionTitle,
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
                {col.tradition_count}{" "}
                {col.tradition_count === 1 ? "tradition" : "traditions"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
