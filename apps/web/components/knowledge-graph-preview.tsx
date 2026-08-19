"use client";

import { useRouter } from "next/navigation";

interface KnowledgeGraphPreviewProps {
  locale: string;
}

const LABELS: Record<string, { title: string; desc: string }> = {
  en: { title: "The Knowledge Graph", desc: "Every question, tradition, concept, and thinker — connected." },
  es: { title: "El Grafo de Conocimiento", desc: "Cada pregunta, tradición, concepto y pensador — conectados." },
  pt: { title: "O Grafo de Conhecimento", desc: "Cada pergunta, tradição, conceito e pensador — conectados." },
  fr: { title: "Le Graphe de Connaissances", desc: "Chaque question, tradition, concept et penseur — connectés." },
  de: { title: "Der Wissensgraph", desc: "Jede Frage, Tradition, jedes Konzept und jeder Denker — verbunden." },
  ar: { title: "رسم المعرفة", desc: "كل سؤال وتقليد ومفهوم ومفكر — مترابطون." },
  hi: { title: "ज्ञान ग्राफ", desc: "हर प्रश्न, परंपरा, अवधारणा और विचारक — जुड़े हुए।" },
  zh: { title: "知识图谱", desc: "每个问题、传统、概念和思想家——互相连接。" },
  ja: { title: "知識グラフ", desc: "すべての問い、伝統、概念、思想家が——つながっている。" },
  he: { title: "גרף הידע", desc: "כל שאלה, מסורת, מושג והוגה — מחוברים." },
};

interface GNode {
  x: number;
  y: number;
  r: number;
  label: string;
  type: "question" | "tradition" | "concept";
}

const NODES: GNode[] = [
  { x: 50, y: 35, r: 6, label: "Death", type: "question" },
  { x: 25, y: 55, r: 5, label: "Buddhism", type: "tradition" },
  { x: 75, y: 50, r: 5, label: "Stoicism", type: "tradition" },
  { x: 35, y: 20, r: 4, label: "Karma", type: "concept" },
  { x: 65, y: 25, r: 4, label: "Soul", type: "concept" },
  { x: 20, y: 35, r: 4, label: "Hinduism", type: "tradition" },
  { x: 80, y: 35, r: 4, label: "Islam", type: "tradition" },
  { x: 40, y: 65, r: 3.5, label: "Rebirth", type: "concept" },
  { x: 60, y: 70, r: 3.5, label: "Judgment", type: "concept" },
  { x: 50, y: 80, r: 5, label: "Meaning", type: "question" },
];

const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 3], [1, 7], [2, 4], [2, 8],
  [5, 3], [6, 4], [6, 8],
  [7, 9], [8, 9], [5, 0],
];

function fillOf(type: string) {
  return type === "question" ? "rgba(198,166,107,0.15)" : type === "tradition" ? "rgba(80,108,134,0.15)" : "rgba(154,165,179,0.1)";
}

function strokeOf(type: string) {
  return type === "question" ? "rgba(198,166,107,0.4)" : type === "tradition" ? "rgba(80,108,134,0.3)" : "rgba(154,165,179,0.2)";
}

export function KnowledgeGraphPreview({ locale }: KnowledgeGraphPreviewProps) {
  const l = LABELS[locale] ?? LABELS["en"]!;
  const router = useRouter();

  return (
    <section className="section-container pb-16 text-center sm:pb-20 lg:pb-[100px]" aria-label={l.title}>
      <p className="m-0 mb-3 text-[11px] font-medium tracking-[0.24em] uppercase text-gold sm:mb-[14px] sm:text-xs sm:tracking-[0.3em]">
        {l.title}
      </p>
      <p className="m-0 mb-7 text-[13px] leading-relaxed text-muted sm:mb-10">
        {l.desc}
      </p>

      <div
        className="mx-auto max-w-[760px] cursor-pointer border border-border p-3 transition-colors hover:border-gold/30 sm:p-6 lg:p-[34px]"
        style={{ background: "rgba(23,29,38,0.5)" }}
        onClick={() => router.push(`/${locale}/search`)}
      >
        <svg viewBox="0 12 100 78" className="block h-auto w-full" role="img" aria-label={l.desc}>
          {EDGES.map(([a, b], i) => {
            const na = NODES[a]!;
            const nb = NODES[b]!;
            return (
              <line
                key={i}
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
                stroke="rgba(198,166,107,0.16)"
                strokeWidth="0.3"
                strokeDasharray="2 3"
                style={{ animation: "dash-flow 9s linear infinite" }}
              />
            );
          })}

          {NODES.map((node, i) => (
            <g key={i}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={fillOf(node.type)}
                stroke={strokeOf(node.type)}
                strokeWidth="0.3"
                style={{ animation: `pulse-glow 6s ease-in-out infinite`, animationDelay: `${i * 340}ms` }}
              />
              <text
                x={node.x}
                y={node.y + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(243,242,238,0.55)"
                fontFamily="var(--font-display)"
                className="graph-label"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}
