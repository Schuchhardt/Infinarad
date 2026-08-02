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
} from "@/lib/data";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

const ACTIVE_LOCALES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
];

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });

  const [questions, collections, subtitle, rule, howTitle] = await Promise.all([
    getQuestions(locale),
    getCollections(locale),
    getHeroSubtitle(locale),
    getTheRule(locale),
    getHowItWorksTitle(locale),
  ]);

  const questionTitle =
    questions.find((q) => q.id === "q_DEATH")?.title ??
    "What happens after death?";

  return (
    <>
      <Nav locale={locale} locales={ACTIVE_LOCALES} />
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
        />
        <TheRule title={rule.title} body={rule.body} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
