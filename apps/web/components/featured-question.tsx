import { Link } from "@/i18n/navigation";

interface FeaturedQuestionProps {
  locale: string;
  title: string;
  slug: string;
  traditions: number;
  concepts: number;
  sources: number;
  authors: number;
  works: number;
}

const LABELS: Record<string, {
  sectionTitle: string;
  traditions: string;
  sources: string;
  concepts: string;
  authors: string;
  works: string;
  explore: string;
}> = {
  en: { sectionTitle: "See what's inside", traditions: "Traditions", sources: "Sources", concepts: "Concepts", authors: "Thinkers", works: "Texts", explore: "Explore" },
  es: { sectionTitle: "Mira lo que contiene", traditions: "Tradiciones", sources: "Fuentes", concepts: "Conceptos", authors: "Pensadores", works: "Textos", explore: "Explorar" },
  pt: { sectionTitle: "Veja o que contém", traditions: "Tradições", sources: "Fontes", concepts: "Conceitos", authors: "Pensadores", works: "Textos", explore: "Explorar" },
  fr: { sectionTitle: "Découvrez le contenu", traditions: "Traditions", sources: "Sources", concepts: "Concepts", authors: "Penseurs", works: "Textes", explore: "Explorer" },
  de: { sectionTitle: "Entdecken Sie den Inhalt", traditions: "Traditionen", sources: "Quellen", concepts: "Konzepte", authors: "Denker", works: "Texte", explore: "Erkunden" },
  ar: { sectionTitle: "شاهد المحتوى", traditions: "تقاليد", sources: "مصادر", concepts: "مفاهيم", authors: "مفكرون", works: "نصوص", explore: "استكشف" },
  hi: { sectionTitle: "अंदर क्या है देखें", traditions: "परंपराएँ", sources: "स्रोत", concepts: "अवधारणाएँ", authors: "विचारक", works: "ग्रंथ", explore: "अन्वेषण" },
  zh: { sectionTitle: "查看内容", traditions: "传统", sources: "文献", concepts: "概念", authors: "思想家", works: "典籍", explore: "探索" },
  ja: { sectionTitle: "中身を見る", traditions: "伝統", sources: "典拠", concepts: "概念", authors: "思想家", works: "典籍", explore: "探索する" },
  he: { sectionTitle: "ראה מה בפנים", traditions: "מסורות", sources: "מקורות", concepts: "מושגים", authors: "הוגים", works: "טקסטים", explore: "חקור" },
};

export function FeaturedQuestion({
  locale,
  title,
  slug,
  traditions,
  concepts,
  sources,
  authors,
  works,
}: FeaturedQuestionProps) {
  const l = LABELS[locale] ?? LABELS["en"]!;

  const stats = [
    { value: traditions, label: l.traditions },
    { value: sources, label: l.sources },
    { value: concepts, label: l.concepts },
    { value: authors, label: l.authors },
    { value: works, label: l.works },
  ].filter((s) => s.value > 0);

  if (stats.length === 0) return null;

  return (
    <section className="px-6 py-24" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-3xl">
        <p
          id="featured-heading"
          className="mb-12 text-center font-mono text-xs tracking-[0.3em] uppercase text-gold"
        >
          {l.sectionTitle}
        </p>

        <div className="rounded-sm border border-parchment/10 bg-ink-light/60 p-8 md:p-12">
          <p className="mb-8 text-center font-display text-2xl leading-snug text-parchment md:text-3xl">
            {title}
          </p>

          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl text-gold md:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 font-mono text-xs tracking-wider text-muted">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href={`/question/${slug}`}
              className="inline-flex items-center gap-2 border border-gold/40 px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase text-gold transition-colors hover:bg-gold/10"
            >
              {l.explore}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
