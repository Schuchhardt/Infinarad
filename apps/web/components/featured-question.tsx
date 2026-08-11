import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/scroll-reveal";

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
  featured: string;
  traditions: string;
  sources: string;
  concepts: string;
  authors: string;
  works: string;
}> = {
  en: { featured: "Featured question", traditions: "Traditions", sources: "Sources", concepts: "Concepts", authors: "Authors", works: "Works" },
  es: { featured: "Pregunta destacada", traditions: "Tradiciones", sources: "Fuentes", concepts: "Conceptos", authors: "Autores", works: "Obras" },
  pt: { featured: "Pergunta em destaque", traditions: "Tradições", sources: "Fontes", concepts: "Conceitos", authors: "Autores", works: "Obras" },
  fr: { featured: "Question en vedette", traditions: "Traditions", sources: "Sources", concepts: "Concepts", authors: "Auteurs", works: "Oeuvres" },
  de: { featured: "Hervorgehobene Frage", traditions: "Traditionen", sources: "Quellen", concepts: "Konzepte", authors: "Autoren", works: "Werke" },
  ar: { featured: "سؤال مميز", traditions: "تقاليد", sources: "مصادر", concepts: "مفاهيم", authors: "مؤلفون", works: "أعمال" },
  hi: { featured: "विशेष प्रश्न", traditions: "परंपराएँ", sources: "स्रोत", concepts: "अवधारणाएँ", authors: "लेखक", works: "रचनाएँ" },
  zh: { featured: "精选问题", traditions: "传统", sources: "文献", concepts: "概念", authors: "作者", works: "著作" },
  ja: { featured: "注目の問い", traditions: "伝統", sources: "典拠", concepts: "概念", authors: "著者", works: "著作" },
  he: { featured: "שאלה מומלצת", traditions: "מסורות", sources: "מקורות", concepts: "מושגים", authors: "מחברים", works: "יצירות" },
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
    { value: concepts, label: l.concepts },
    { value: sources, label: l.sources },
    { value: authors, label: l.authors },
    { value: works, label: l.works },
  ].filter((s) => s.value > 0);

  if (stats.length === 0) return null;

  return (
    <section className="section-container pb-[100px]" aria-labelledby="featured-heading">
      <ScrollReveal>
        <Link
          href={`/question/${slug}`}
          className="group relative block overflow-hidden border border-border transition-colors hover:border-gold/35 no-underline"
          style={{ background: "linear-gradient(120deg, #10151D 0%, #0D1219 100%)" }}
        >
          <div className="flex items-stretch flex-wrap">
            {/* Image placeholder */}
            <div className="relative w-[420px] h-[340px] shrink-0 overflow-hidden bg-[#0D1219] hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-surface" style={{ background: "linear-gradient(90deg, transparent 55%, #10151D 100%)" }} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-[320px] p-[52px_56px] flex flex-col gap-[22px] justify-center">
              <span
                id="featured-heading"
                className="flex items-center gap-[9px] text-[11px] font-medium tracking-[0.3em] uppercase text-gold"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#C6A66B" strokeWidth="1.1">
                  <path d="M8 2.2l1.7 3.9 4.1.4-3.1 2.8.9 4.1L8 11.3l-3.6 2.1.9-4.1L2.2 6.5l4.1-.4z"/>
                </svg>
                {l.featured}
              </span>

              <h2 className="m-0 font-display font-normal text-[46px] leading-[1.14] tracking-[0.01em] text-text" style={{ textWrap: "pretty" }}>
                {title}
              </h2>

              <span className="text-[11px] text-faint tracking-[0.04em]">
                /{locale}/question/{slug}
              </span>

              <div className="flex gap-[34px] flex-wrap pt-2">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col gap-[5px] min-w-[72px]">
                    <span className="font-display text-[34px] leading-none text-gold tabular-nums">
                      {s.value}
                    </span>
                    <span className="text-[10px] font-medium tracking-[0.16em] uppercase text-muted">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Link>
      </ScrollReveal>
    </section>
  );
}
