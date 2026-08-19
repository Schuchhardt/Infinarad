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
    <section className="section-container pb-16 sm:pb-20 lg:pb-[100px]" aria-labelledby="featured-heading">
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
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 p-6 sm:gap-[22px] sm:p-10 lg:p-[52px_56px]">
              <span
                id="featured-heading"
                className="flex items-center gap-[9px] text-[10px] font-medium tracking-[0.24em] uppercase text-gold sm:text-[11px] sm:tracking-[0.3em]"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#C6A66B" strokeWidth="1.1">
                  <path d="M8 2.2l1.7 3.9 4.1.4-3.1 2.8.9 4.1L8 11.3l-3.6 2.1.9-4.1L2.2 6.5l4.1-.4z"/>
                </svg>
                {l.featured}
              </span>

              <h2 className="m-0 font-display text-[28px] font-normal leading-[1.2] tracking-[0.01em] text-text sm:text-[36px] lg:text-[46px] lg:leading-[1.14]" style={{ textWrap: "pretty" }}>
                {title}
              </h2>

              <span className="hidden break-all text-[10.5px] tracking-[0.04em] text-faint sm:inline sm:text-[11px]">
                /{locale}/question/{slug}
              </span>

              <div className="grid grid-cols-3 gap-x-4 gap-y-5 pt-2 sm:flex sm:flex-wrap sm:gap-[34px]">
                {stats.map((s) => (
                  <div key={s.label} className="flex min-w-0 flex-col gap-[5px] sm:min-w-[72px]">
                    <span className="font-display text-[26px] leading-none text-gold tabular-nums sm:text-[34px]">
                      {s.value}
                    </span>
                    <span className="text-[9.5px] font-medium tracking-[0.12em] uppercase text-muted sm:text-[10px] sm:tracking-[0.16em]">
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
