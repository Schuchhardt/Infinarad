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
      <main className="min-h-screen pt-20">
        <div className="px-6 pb-16 pt-24">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 font-mono text-xs text-muted/60 hover:text-gold transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              {t("backHome", locale)}
            </Link>

            <div className="mb-16">
              <SearchBar
                locale={locale}
                placeholder={t("searchPlaceholder", locale)}
                suggestions={suggestions}
              />
            </div>

            <p className="mb-8 font-mono text-xs tracking-[0.3em] uppercase text-gold">
              {query ? t("results", locale) : t("allQuestions", locale)}
            </p>

            {results.length === 0 ? (
              <p className="text-muted">{t("noResults", locale)}</p>
            ) : (
              <ol className="list-none space-y-8 p-0">
                {results.map((r, i) => (
                  <li key={r.id}>
                    <Link
                      href={`/question/${r.slug}`}
                      className="group flex items-baseline gap-6"
                    >
                      <span className="shrink-0 font-mono text-xs text-muted/40 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h2
                          className="font-display text-2xl text-parchment group-hover:text-gold transition-colors md:text-3xl"
                          lang={r.is_fallback ? "en" : undefined}
                        >
                          {r.title}
                        </h2>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                          {r.summary}
                        </p>
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
