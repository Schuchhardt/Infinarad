export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ConceptsSection } from "@/components/question/concepts-section";
import { TraditionsSection } from "@/components/question/traditions-section";
import { AuthorsSection } from "@/components/question/authors-section";
import { WorksSection } from "@/components/question/works-section";
import { PracticesSection } from "@/components/question/practices-section";
import { SymbolsSection } from "@/components/question/symbols-section";
import { DocumentariesSection } from "@/components/question/documentaries-section";
import { SourcesSection } from "@/components/question/sources-section";
import {
  getQuestionBySlug,
  getRelatedConcepts,
  getRelatedTraditions,
  getRelatedAuthors,
  getRelatedWorks,
  getRelatedPractices,
  getRelatedSymbols,
  getDocumentaries,
  getQuestionSources,
} from "@/lib/questions";
import { getActiveLocales } from "@/lib/data";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const SECTION_LABELS: Record<string, Record<string, string>> = {
  concepts: {
    en: "Concepts",
    es: "Conceptos",
    pt: "Conceitos",
    fr: "Concepts",
    de: "Konzepte",
    ar: "المفاهيم",
    hi: "अवधारणाएँ",
    zh: "概念",
    ja: "概念",
    he: "מושגים",
  },
  traditions: {
    en: "Traditions",
    es: "Tradiciones",
    pt: "Tradições",
    fr: "Traditions",
    de: "Traditionen",
    ar: "التقاليد",
    hi: "परंपराएँ",
    zh: "传统",
    ja: "伝統",
    he: "מסורות",
  },
  authors: {
    en: "Authors",
    es: "Autores",
    pt: "Autores",
    fr: "Auteurs",
    de: "Autoren",
    ar: "المؤلفون",
    hi: "लेखक",
    zh: "作者",
    ja: "著者",
    he: "מחברים",
  },
  works: {
    en: "Works",
    es: "Obras",
    pt: "Obras",
    fr: "Oeuvres",
    de: "Werke",
    ar: "الأعمال",
    hi: "रचनाएँ",
    zh: "著作",
    ja: "著作",
    he: "יצירות",
  },
  practices: {
    en: "Practices",
    es: "Prácticas",
    pt: "Práticas",
    fr: "Pratiques",
    de: "Praktiken",
    ar: "الممارسات",
    hi: "साधनाएँ",
    zh: "修行",
    ja: "実践",
    he: "מנהגים",
  },
  symbols: {
    en: "Symbols",
    es: "Símbolos",
    pt: "Símbolos",
    fr: "Symboles",
    de: "Symbole",
    ar: "الرموز",
    hi: "प्रतीक",
    zh: "象征",
    ja: "象徴",
    he: "סמלים",
  },
  documentaries: {
    en: "Documentaries",
    es: "Documentales",
    pt: "Documentários",
    fr: "Documentaires",
    de: "Dokumentationen",
    ar: "الأفلام الوثائقية",
    hi: "वृत्तचित्र",
    zh: "纪录片",
    ja: "ドキュメンタリー",
    he: "סרטים תיעודיים",
  },
  sources: {
    en: "Sources & Citations",
    es: "Fuentes y Citas",
    pt: "Fontes e Citações",
    fr: "Sources et Citations",
    de: "Quellen und Zitate",
    ar: "المصادر والاستشهادات",
    hi: "स्रोत और उद्धरण",
    zh: "文献与引用",
    ja: "典拠と引用",
    he: "מקורות וציטוטים",
  },
  backToQuestions: {
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
};

function label(section: string, locale: string): string {
  return SECTION_LABELS[section]?.[locale] ?? SECTION_LABELS[section]?.["en"] ?? section;
}

const BASE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://infinarad.com";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const question = await getQuestionBySlug(slug, locale);
  if (!question) return {};

  return {
    title: question.title,
    description: question.summary,
    alternates: {
      canonical: `${BASE_URL}/${locale}/question/${slug}`,
    },
    openGraph: {
      type: "article",
      locale,
      title: question.title,
      description: question.summary,
    },
  };
}

export default async function QuestionPage({ params }: Props) {
  const { locale, slug } = await params;
  const question = await getQuestionBySlug(slug, locale);

  if (!question) notFound();

  const [concepts, traditions, documentaries, sources, activeLocales] =
    await Promise.all([
      getRelatedConcepts(question.id, locale),
      getRelatedTraditions(question.id, locale),
      getDocumentaries(question.id, locale),
      getQuestionSources(question.id),
      getActiveLocales(),
    ]);

  const traditionIds = traditions.map((t) => t.id);
  const [authors, works, practices, symbols] = await Promise.all([
    getRelatedAuthors(traditionIds, locale),
    getRelatedWorks(traditionIds, locale),
    getRelatedPractices(traditionIds, locale),
    getRelatedSymbols(traditionIds, locale),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    name: question.title,
    description: question.summary,
    url: `${BASE_URL}/${locale}/question/${slug}`,
    inLanguage: locale,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav locale={locale} locales={activeLocales} />
      <main className="pt-20">
        <header className="px-6 pb-16 pt-24">
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
              {label("backToQuestions", locale)}
            </Link>
            <h1
              className="font-display text-4xl leading-tight text-parchment md:text-6xl"
              lang={question.is_fallback ? "en" : undefined}
            >
              {question.title}
              {question.is_fallback && (
                <span className="ms-4 inline-block align-middle rounded border border-muted/30 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-muted">
                  EN
                </span>
              )}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              {question.summary}
            </p>
          </div>
        </header>

        <ConceptsSection
          concepts={concepts}
          title={label("concepts", locale)}
        />
        <TraditionsSection
          traditions={traditions}
          title={label("traditions", locale)}
        />
        <AuthorsSection
          authors={authors}
          title={label("authors", locale)}
        />
        <WorksSection works={works} title={label("works", locale)} />
        <PracticesSection
          practices={practices}
          title={label("practices", locale)}
        />
        <SymbolsSection
          symbols={symbols}
          title={label("symbols", locale)}
        />
        <DocumentariesSection
          documentaries={documentaries}
          title={label("documentaries", locale)}
        />
        <SourcesSection
          sources={sources}
          title={label("sources", locale)}
        />
      </main>
      <Footer locale={locale} />
    </>
  );
}
