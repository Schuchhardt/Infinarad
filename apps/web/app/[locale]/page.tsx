export const dynamic = "force-dynamic";

import { Hero } from "@/components/hero";
import { QuestionsSection } from "@/components/questions-section";
import { HowItWorks } from "@/components/how-it-works";
import { CollectionsSection } from "@/components/collections-section";
import { TheRule } from "@/components/the-rule";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import {
  getQuestions,
  getCollections,
  getHeroSubtitle,
  getTheRule,
  getHowItWorksTitle,
  getActiveLocales,
} from "@/lib/data";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

const BASE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://infinarad.com";

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const [questions, collections, subtitle, rule, howTitle, activeLocales] =
    await Promise.all([
      getQuestions(locale),
      getCollections(locale),
      getHeroSubtitle(locale),
      getTheRule(locale),
      getHowItWorksTitle(locale),
      getActiveLocales(),
    ]);

  const questionTitle =
    questions.find((q) => q.id === "q_DEATH")?.title ??
    "What happens after death?";

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
        <Hero questionTitle={questionTitle} subtitle={subtitle} />
        <QuestionsSection
          questions={questions}
          sectionTitle={t("questionsTitle")}
        />
        <HowItWorks sectionTitle={howTitle} locale={locale} />
        <CollectionsSection
          collections={collections}
          sectionTitle={t("collectionsTitle")}
          locale={locale}
        />
        <TheRule title={rule.title} body={rule.body} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
