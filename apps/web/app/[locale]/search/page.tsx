export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SearchBar } from "@/components/search-bar";
import { searchQuestions, getFeaturedQuestions } from "@/lib/questions";
import { getActiveLocales } from "@/lib/data";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

const LABELS: Record<string, Record<string, string>> = {
  searchPlaceholder: {
    en: "Search a question...",
    es: "Buscar una pregunta...",
    pt: "Buscar uma pergunta...",
    fr: "Rechercher une question...",
    de: "Eine Frage suchen...",
    ar: "ابحث عن سؤال...",
    hi: "एक प्रश्न खोजें...",
    zh: "搜索问题...",
    ja: "問いを検索...",
    he: "חפש שאלה...",
  },
  search: {
    en: "Search",
    es: "Buscar",
    pt: "Buscar",
    fr: "Chercher",
    de: "Suchen",
    ar: "بحث",
    hi: "खोजें",
    zh: "搜索",
    ja: "検索",
    he: "חיפוש",
  },
  results: {
    en: "Results",
    es: "Resultados",
    pt: "Resultados",
    fr: "Résultats",
    de: "Ergebnisse",
    ar: "النتائج",
    hi: "परिणाम",
    zh: "结果",
    ja: "結果",
    he: "תוצאות",
  },
  noResults: {
    en: "No questions found.",
    es: "No se encontraron preguntas.",
    pt: "Nenhuma pergunta encontrada.",
    fr: "Aucune question trouvée.",
    de: "Keine Fragen gefunden.",
    ar: "لم يتم العثور على أسئلة.",
    hi: "कोई प्रश्न नहीं मिला।",
    zh: "未找到问题。",
    ja: "問いが見つかりませんでした。",
    he: "לא נמצאו שאלות.",
  },
  allQuestions: {
    en: "All Questions",
    es: "Todas las Preguntas",
    pt: "Todas as Perguntas",
    fr: "Toutes les Questions",
    de: "Alle Fragen",
    ar: "جميع الأسئلة",
    hi: "सभी प्रश्न",
    zh: "所有问题",
    ja: "すべての問い",
    he: "כל השאלות",
  },
  backHome: {
    en: "Back to home",
    es: "Volver al inicio",
    pt: "Voltar ao início",
    fr: "Retour à l'accueil",
    de: "Zurück zur Startseite",
    ar: "العودة إلى الرئيسية",
    hi: "होम पर वापस जाएँ",
    zh: "返回首页",
    ja: "ホームに戻る",
    he: "חזרה לדף הבית",
  },
  suggest: {
    en: "Try exploring",
    es: "Prueba explorar",
    pt: "Tente explorar",
    fr: "Essayez d'explorer",
    de: "Versuchen Sie",
    ar: "جرب استكشاف",
    hi: "अन्वेषण करें",
    zh: "试试探索",
    ja: "探索してみる",
    he: "נסו לחקור",
  },
};

function t(key: string, locale: string): string {
  return LABELS[key]?.[locale] ?? LABELS[key]?.["en"] ?? key;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { q } = await searchParams;
  return {
    title: q ? `${q} — Infinarad` : `${t("allQuestions", locale)} — Infinarad`,
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [results, featured, activeLocales] = await Promise.all([
    query ? searchQuestions(query, locale) : getFeaturedQuestions(locale),
    getFeaturedQuestions(locale),
    getActiveLocales(),
  ]);

  const suggestions = featured.map((f) => ({ slug: f.slug, title: f.title }));

  return (
    <>
      <Nav locale={locale} locales={activeLocales} />
      <main className="min-h-screen pt-16">
        <div className="px-6 pb-16 pt-24">
          <div className="mx-auto max-w-[860px]">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase text-dim hover:text-gold transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              {t("backHome", locale)}
            </Link>

            <div className="mb-16">
              <SearchBar
                locale={locale}
                placeholder={t("searchPlaceholder", locale)}
                suggestions={suggestions}
                searchLabel={t("search", locale)}
              />
            </div>

            {!query && featured.length > 0 && (
              <div className="mb-12 flex flex-wrap gap-2 items-center">
                <span className="text-[11px] tracking-[0.08em] uppercase text-dim mr-2">
                  {t("suggest", locale)}
                </span>
                {featured.slice(0, 4).map((f) => (
                  <Link
                    key={f.slug}
                    href={`/question/${f.slug}`}
                    className="border border-border px-3 py-[6px] text-[12px] text-muted hover:text-text hover:border-gold/40 transition-colors"
                  >
                    {f.title.length > 40 ? f.title.slice(0, 40) + "..." : f.title}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mb-8">
              <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-gold">
                {query ? t("results", locale) : t("allQuestions", locale)}
              </span>
              <span className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-dim tabular-nums">
                {String(results.length).padStart(2, "0")}
              </span>
            </div>

            {results.length === 0 ? (
              <p className="text-muted text-[14px]">{t("noResults", locale)}</p>
            ) : (
              <ol className="list-none space-y-0 p-0 border border-border" style={{ gap: "1px", background: "#232D39" }}>
                {results.map((r, i) => (
                  <li key={r.id} className="bg-background">
                    <Link
                      href={`/question/${r.slug}`}
                      className="group flex items-baseline gap-5 p-[20px_22px] transition-colors hover:bg-surface"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <span className="shrink-0 text-[10.5px] text-dim tabular-nums w-6 text-right">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h2
                          className="font-display text-[22px] leading-[1.3] text-text group-hover:text-gold transition-colors md:text-[26px]"
                          lang={r.is_fallback ? "en" : undefined}
                        >
                          {r.title}
                        </h2>
                        {r.summary && (
                          <p className="mt-[6px] text-[13px] leading-[1.7] text-muted line-clamp-2">
                            {r.summary}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
