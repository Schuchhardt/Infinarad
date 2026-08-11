export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { GraphView } from "@/components/graph-view";
import { getGraphData } from "@/lib/questions";
import { getActiveLocales } from "@/lib/data";

type Props = {
  params: Promise<{ locale: string }>;
};

const LABELS: Record<string, Record<string, string>> = {
  title: {
    en: "The Knowledge Graph",
    es: "El Grafo de Conocimiento",
    pt: "O Grafo de Conhecimento",
    fr: "Le Graphe de Connaissances",
    de: "Der Wissensgraph",
    ar: "رسم المعرفة",
    hi: "ज्ञान ग्राफ",
    zh: "知识图谱",
    ja: "ナレッジグラフ",
    he: "גרף הידע",
  },
  desc: {
    en: "Every question, tradition, concept, and thinker — connected.",
    es: "Cada pregunta, tradición, concepto y pensador — conectados.",
    pt: "Cada pergunta, tradição, conceito e pensador — conectados.",
    fr: "Chaque question, tradition, concept et penseur — connectés.",
    de: "Jede Frage, Tradition, jedes Konzept und jeder Denker — verbunden.",
    ar: "كل سؤال وتقليد ومفهوم ومفكر — متصلون.",
    hi: "हर प्रश्न, परंपरा, अवधारणा और विचारक — जुड़े हुए।",
    zh: "每一个问题、传统、概念与思想家——互相连接。",
    ja: "すべての問い、伝統、概念、思想家がつながる。",
    he: "כל שאלה, מסורת, מושג והוגה — מחוברים.",
  },
  question: {
    en: "Question", es: "Pregunta", pt: "Pergunta", fr: "Question", de: "Frage",
    ar: "سؤال", hi: "प्रश्न", zh: "问题", ja: "問い", he: "שאלה",
  },
  tradition: {
    en: "Tradition", es: "Tradición", pt: "Tradição", fr: "Tradition", de: "Tradition",
    ar: "تقليد", hi: "परंपरा", zh: "传统", ja: "伝統", he: "מסורת",
  },
  concept: {
    en: "Concept", es: "Concepto", pt: "Conceito", fr: "Concept", de: "Konzept",
    ar: "مفهوم", hi: "अवधारणा", zh: "概念", ja: "概念", he: "מושג",
  },
  openQuestion: {
    en: "Open the question", es: "Abrir la pregunta", pt: "Abrir a pergunta",
    fr: "Ouvrir la question", de: "Frage öffnen", ar: "افتح السؤال",
    hi: "प्रश्न खोलें", zh: "打开问题", ja: "問いを開く", he: "פתח את השאלה",
  },
  entity: {
    en: "Entity", es: "Entidad", pt: "Entidade", fr: "Entité", de: "Entität",
    ar: "كيان", hi: "इकाई", zh: "实体", ja: "エンティティ", he: "ישות",
  },
  edges: {
    en: "Edges", es: "Enlaces", pt: "Arestas", fr: "Arêtes", de: "Kanten",
    ar: "الروابط", hi: "कड़ियाँ", zh: "边", ja: "辺", he: "קשתות",
  },
  collection: {
    en: "Collection", es: "Colección", pt: "Coleção", fr: "Collection", de: "Sammlung",
    ar: "مجموعة", hi: "संग्रह", zh: "集合", ja: "コレクション", he: "אוסף",
  },
};

function t(key: string, locale: string): string {
  return LABELS[key]?.[locale] ?? LABELS[key]?.["en"] ?? key;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `${t("title", locale)} — Infinarad`,
  };
}

export default async function GraphPage({ params }: Props) {
  const { locale } = await params;
  const [{ nodes, edges }, activeLocales] = await Promise.all([
    getGraphData(locale),
    getActiveLocales(),
  ]);

  const graphLabels = {
    title: t("title", locale),
    desc: t("desc", locale),
    question: t("question", locale),
    tradition: t("tradition", locale),
    concept: t("concept", locale),
    openQuestion: t("openQuestion", locale),
    entity: t("entity", locale),
    edges: t("edges", locale),
    collection: t("collection", locale),
  };

  return (
    <>
      <Nav locale={locale} locales={activeLocales} />
      <main className="pt-16">
        <GraphView
          nodes={nodes}
          edges={edges}
          labels={graphLabels}
          locale={locale}
        />
      </main>
      <Footer locale={locale} />
    </>
  );
}
