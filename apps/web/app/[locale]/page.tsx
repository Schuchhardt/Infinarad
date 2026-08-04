export const dynamic = "force-dynamic";

import { Hero } from "@/components/hero";
import { QuestionsSection } from "@/components/questions-section";
import { HowItWorks } from "@/components/how-it-works";
import { CollectionsSection } from "@/components/collections-section";
import { TheRule } from "@/components/the-rule";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { SearchBar } from "@/components/search-bar";
import { FeaturedQuestion } from "@/components/featured-question";
import { LiveStats } from "@/components/live-stats";
import { Timeline } from "@/components/timeline";
import { KnowledgeGraphPreview } from "@/components/knowledge-graph-preview";
import {
  getQuestions,
  getCollections,
  getHowItWorksTitle,
  getActiveLocales,
  getPlatformStats,
  getFeaturedQuestionStats,
} from "@/lib/data";
import { getTranslations } from "next-intl/server";

const SEARCH_PLACEHOLDERS: Record<string, string> = {
  en: "Ask humanity...",
  es: "Pregúntale a la humanidad...",
  pt: "Pergunte à humanidade...",
  fr: "Demandez à l'humanité...",
  de: "Fragen Sie die Menschheit...",
  ar: "اسأل البشرية...",
  hi: "मानवता से पूछें...",
  zh: "向人类提问...",
  ja: "人類に問う...",
  he: "שאל את האנושות...",
};

const DESCRIPTORS: Record<string, string> = {
  en: "The Living Atlas of Humanity's Biggest Questions",
  es: "El Atlas Vivo de las Grandes Preguntas de la Humanidad",
  pt: "O Atlas Vivo das Maiores Questões da Humanidade",
  fr: "L'Atlas Vivant des Plus Grandes Questions de l'Humanité",
  de: "Der Lebendige Atlas der Größten Fragen der Menschheit",
  ar: "الأطلس الحي لأكبر أسئلة البشرية",
  hi: "मानवता के सबसे बड़े प्रश्नों का जीवित मानचित्र",
  zh: "人类最大问题的活地图集",
  ja: "人類の最大の問いの生きた地図帳",
  he: "האטלס החי של השאלות הגדולות של האנושות",
};

type Props = {
  params: Promise<{ locale: string }>;
};

const BASE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://infinarad.com";

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const [questions, collections, howTitle, activeLocales, stats, featured] =
    await Promise.all([
      getQuestions(locale),
      getCollections(locale),
      getHowItWorksTitle(locale),
      getActiveLocales(),
      getPlatformStats(),
      getFeaturedQuestionStats("q_DEATH", locale),
    ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: tc("appName"),
    description: tc("description"),
    url: `${BASE_URL}/${locale}`,
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/${locale}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav locale={locale} locales={activeLocales} />
      <main>
        <Hero
          locale={locale}
          descriptor={DESCRIPTORS[locale] ?? DESCRIPTORS["en"]!}
        />

        <section className="section-container py-16">
          <SearchBar
            locale={locale}
            placeholder={SEARCH_PLACEHOLDERS[locale] ?? SEARCH_PLACEHOLDERS["en"]!}
            suggestions={questions.map((q) => ({
              slug: q.slug,
              title: q.title,
            }))}
          />
        </section>

        {featured && (
          <FeaturedQuestion
            locale={locale}
            title={featured.title}
            slug={featured.slug}
            traditions={featured.tradition_count}
            concepts={featured.concept_count}
            sources={featured.source_count}
            authors={featured.author_count}
            works={featured.work_count}
          />
        )}

        <CollectionsSection
          collections={collections}
          sectionTitle={t("collectionsTitle")}
          locale={locale}
        />

        <KnowledgeGraphPreview locale={locale} />

        <Timeline locale={locale} />

        <LiveStats
          locale={locale}
          traditions={stats.traditions}
          concepts={stats.concepts}
          sources={stats.sources}
          authors={stats.authors}
        />

        <HowItWorks sectionTitle={howTitle} locale={locale} />

        <QuestionsSection
          questions={questions}
          sectionTitle={t("questionsTitle")}
          locale={locale}
        />

        <TheRule locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
