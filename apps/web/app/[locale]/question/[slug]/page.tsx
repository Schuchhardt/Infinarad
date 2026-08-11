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

interface SidebarSection {
  id: string;
  label: string;
  count: number;
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

  const sidebarSections: SidebarSection[] = [
    { id: "s1", label: label("concepts", locale), count: concepts.length },
    { id: "s2", label: label("traditions", locale), count: traditions.length },
    { id: "s3", label: label("authors", locale), count: authors.length },
    { id: "s4", label: label("works", locale), count: works.length },
    { id: "s5", label: label("practices", locale), count: practices.length },
    { id: "s6", label: label("symbols", locale), count: symbols.length },
    { id: "s7", label: label("documentaries", locale), count: documentaries.length },
    { id: "s8", label: label("sources", locale), count: sources.length },
  ].filter((s) => s.count > 0);

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
      <main className="pt-16">
        <header className="px-6 pb-12 pt-24">
          <div className="mx-auto max-w-[1120px]">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase text-dim hover:text-gold transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              {label("backToQuestions", locale)}
            </Link>
            <h1
              className="font-display text-[38px] leading-[1.15] text-text md:text-[54px]"
              lang={question.is_fallback ? "en" : undefined}
            >
              {question.title}
              {question.is_fallback && (
                <span className="ms-4 inline-block align-middle border border-muted/30 px-2 py-[3px] text-[9px] font-medium uppercase tracking-[0.12em] text-muted">
                  EN
                </span>
              )}
            </h1>
            {question.summary && (
              <p className="mt-6 max-w-2xl text-[16px] leading-[1.75] text-muted">
                {question.summary}
              </p>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-[1120px] flex gap-0">
          <aside className="hidden lg:block w-[200px] shrink-0">
            <nav className="sticky top-[84px] py-4 flex flex-col gap-[2px]">
              {sidebarSections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center justify-between px-3 py-[9px] text-[12px] text-dim hover:text-text transition-colors group"
                >
                  <span className="group-hover:text-text">{s.label}</span>
                  <span className="text-[10px] text-faint tabular-nums">
                    {String(s.count).padStart(2, "0")}
                  </span>
                </a>
              ))}
            </nav>
          </aside>

          <div className="flex-1 min-w-0 px-6 lg:px-0 lg:pl-8 pb-24">
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
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
