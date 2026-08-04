"use client";

import { useEffect, useRef } from "react";

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

interface Node {
  x: number;
  y: number;
  r: number;
  label: string;
  type: "question" | "tradition" | "concept";
}

const NODES: Node[] = [
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

export function KnowledgeGraphPreview({ locale }: KnowledgeGraphPreviewProps) {
  const l = LABELS[locale] ?? LABELS["en"]!;
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    function handleMove(e: MouseEvent) {
      const rect = svg!.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;

      const circles = svg!.querySelectorAll<SVGCircleElement>(".graph-node");
      circles.forEach((circle) => {
        const cx = parseFloat(circle.getAttribute("cx") || "0");
        const cy = parseFloat(circle.getAttribute("cy") || "0");
        const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
        const glow = Math.max(0, 1 - dist / 30);
        circle.style.opacity = String(0.4 + glow * 0.6);
        circle.style.filter = glow > 0.2 ? `drop-shadow(0 0 ${glow * 4}px rgba(198, 166, 107, ${glow * 0.5}))` : "none";
      });
    }

    function handleLeave() {
      const circles = svg!.querySelectorAll<SVGCircleElement>(".graph-node");
      circles.forEach((circle) => {
        circle.style.opacity = "0.4";
        circle.style.filter = "none";
      });
    }

    svg.addEventListener("mousemove", handleMove);
    svg.addEventListener("mouseleave", handleLeave);
    return () => {
      svg.removeEventListener("mousemove", handleMove);
      svg.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <section className="section-container py-28" aria-label={l.title}>
      <div className="text-center">
        <p className="mb-4 text-sm font-medium tracking-[0.3em] uppercase text-gold">
          {l.title}
        </p>
        <p className="mb-16 text-sm text-muted">
          {l.desc}
        </p>
      </div>

      <div className="mx-auto max-w-3xl rounded-[20px] border border-border bg-card/50 p-6 md:p-10">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="h-auto w-full"
          aria-hidden="true"
        >
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
                stroke="rgba(198, 166, 107, 0.12)"
                strokeWidth="0.3"
              />
            );
          })}

          {NODES.map((node, i) => (
            <g key={i}>
              <circle
                className="graph-node"
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill={
                  node.type === "question"
                    ? "rgba(198, 166, 107, 0.15)"
                    : node.type === "tradition"
                      ? "rgba(80, 108, 134, 0.15)"
                      : "rgba(154, 165, 179, 0.1)"
                }
                stroke={
                  node.type === "question"
                    ? "rgba(198, 166, 107, 0.4)"
                    : node.type === "tradition"
                      ? "rgba(80, 108, 134, 0.3)"
                      : "rgba(154, 165, 179, 0.2)"
                }
                strokeWidth="0.3"
                style={{ opacity: 0.4, transition: "opacity 300ms, filter 300ms" }}
              />
              <text
                x={node.x}
                y={node.y + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(243, 242, 238, 0.5)"
                fontSize="2.2"
                fontFamily="var(--font-display)"
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
