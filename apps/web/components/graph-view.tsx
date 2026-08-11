"use client";

import { useState, useMemo } from "react";
import type { GraphNode, GraphEdge } from "@/lib/questions";

interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  labels: {
    title: string;
    desc: string;
    question: string;
    tradition: string;
    concept: string;
    openQuestion: string;
    entity: string;
    edges: string;
    collection: string;
  };
  locale: string;
}

const GOLD = "#C6A66B";
const ACCENT = "#506C86";
const MUTED = "#9AA5B3";

function colorOf(type: string) {
  if (type === "question") return GOLD;
  if (type === "tradition") return ACCENT;
  return MUTED;
}

function fillOf(type: string) {
  if (type === "question") return "rgba(198,166,107,.12)";
  if (type === "tradition") return "rgba(80,108,134,.12)";
  return "rgba(154,165,179,.08)";
}

function sizeOf(type: string) {
  if (type === "question") return 28;
  if (type === "tradition") return 20;
  return 14;
}

function layoutNodes(nodes: GraphNode[]) {
  const questions = nodes.filter((n) => n.type === "question");
  const traditions = nodes.filter((n) => n.type === "tradition");
  const concepts = nodes.filter((n) => n.type === "concept");

  const positioned: Array<GraphNode & { x: number; y: number }> = [];

  questions.forEach((n, i) => {
    const angle = (i / Math.max(questions.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const r = 120;
    positioned.push({ ...n, x: 500 + Math.cos(angle) * r, y: 350 + Math.sin(angle) * r });
  });

  traditions.forEach((n, i) => {
    const angle = (i / Math.max(traditions.length, 1)) * Math.PI * 2 - Math.PI / 4;
    const r = 240 + (i % 3) * 30;
    positioned.push({ ...n, x: 500 + Math.cos(angle) * r, y: 350 + Math.sin(angle) * r });
  });

  concepts.forEach((n, i) => {
    const angle = (i / Math.max(concepts.length, 1)) * Math.PI * 2;
    const r = 300 + (i % 4) * 20;
    positioned.push({ ...n, x: 500 + Math.cos(angle) * r, y: 350 + Math.sin(angle) * r });
  });

  return positioned;
}

export function GraphView({ nodes, edges, labels, locale }: GraphViewProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const positioned = useMemo(() => layoutNodes(nodes), [nodes]);
  const nodeMap = useMemo(() => {
    const map = new Map<string, (typeof positioned)[0]>();
    positioned.forEach((n) => map.set(n.id, n));
    return map;
  }, [positioned]);

  const selectedNode = selected ? nodeMap.get(selected) : null;
  const edgeCount = selected
    ? edges.filter((e) => e.from_id === selected || e.to_id === selected).length
    : 0;

  const legend = [
    { color: GOLD, label: labels.question },
    { color: ACCENT, label: labels.tradition },
    { color: MUTED, label: labels.concept },
  ];

  return (
    <div className="flex items-stretch min-h-[780px]">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-none px-10 py-[30px] flex items-end justify-between gap-7 flex-wrap border-b border-border">
          <div className="flex flex-col gap-[9px]">
            <p className="m-0 text-[12px] font-medium tracking-[0.3em] uppercase text-gold">
              {labels.title}
            </p>
            <span className="text-[13.5px] text-muted max-w-[440px] leading-[1.65]">
              {labels.desc}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {legend.map((g) => (
              <div
                key={g.label}
                className="flex items-center gap-[7px] px-3 py-[6px] border border-border bg-surface"
              >
                <div className="w-[7px] h-[7px] rounded-full" style={{ background: g.color }} />
                <span className="text-[9.5px] font-medium tracking-[0.12em] uppercase text-muted">
                  {g.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex-1 relative overflow-hidden min-h-[620px]"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(80,108,134,.09) 0%, transparent 65%)" }}
        >
          <svg viewBox="0 0 1000 700" className="absolute inset-0 w-full h-full">
            {edges.map((e, i) => {
              const from = nodeMap.get(e.from_id);
              const to = nodeMap.get(e.to_id);
              if (!from || !to) return null;
              const hot = selected === e.from_id || selected === e.to_id;
              return (
                <line
                  key={i}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={hot ? "rgba(198,166,107,.5)" : "rgba(198,166,107,.14)"}
                  strokeWidth={hot ? 1.6 : 1}
                  strokeDasharray="4 6"
                  className="animate-[dash-flow_7s_linear_infinite]"
                />
              );
            })}
          </svg>

          {positioned.map((n, i) => {
            const sel = selected === n.id;
            const size = sizeOf(n.type);
            return (
              <div
                key={n.id}
                onClick={() => setSelected(n.id)}
                className="absolute cursor-pointer flex flex-col items-center gap-[9px] w-[150px]"
                style={{
                  left: `${(n.x / 1000) * 100}%`,
                  top: `${(n.y / 700) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className="relative rounded-full"
                  style={{
                    width: size,
                    height: size,
                    border: `1px solid ${sel ? GOLD : colorOf(n.type)}`,
                    background: sel ? "rgba(198,166,107,.2)" : fillOf(n.type),
                    boxShadow: sel ? "0 0 32px rgba(198,166,107,.4)" : "none",
                  }}
                >
                  <div
                    className="absolute -inset-[6px] rounded-full animate-[ring-out_4s_ease-out_infinite]"
                    style={{
                      border: `1px solid ${sel ? "rgba(198,166,107,.4)" : colorOf(n.type)}`,
                      animationDelay: `${i * 380}ms`,
                    }}
                  />
                </div>
                <span
                  className="font-display text-center leading-[1.25]"
                  style={{
                    fontSize: n.type === "question" ? 17 : 14,
                    color: sel ? "#F3F2EE" : "rgba(243,242,238,.55)",
                  }}
                >
                  {n.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-[380px] hidden lg:flex flex-none border-l border-border bg-surface p-[32px_30px_40px] flex-col gap-[18px]">
        {selectedNode ? (
          <>
            <span className="text-[9.5px] font-medium tracking-[0.2em] uppercase text-dim">
              {selectedNode.type === "question"
                ? labels.question
                : selectedNode.type === "tradition"
                  ? labels.tradition
                  : labels.concept}
            </span>
            <h3 className="m-0 font-display font-normal text-[32px] leading-[1.16]" style={{ textWrap: "pretty" as never }}>
              {selectedNode.name}
            </h3>
            <p className="m-0 text-[14px] leading-[1.75] text-muted">
              {selectedNode.summary || labels.desc}
            </p>
            <div className="flex flex-col border border-border" style={{ gap: "1px", background: "#232D39" }}>
              <div className="bg-surface p-[13px_15px] flex gap-3">
                <span className="w-[78px] flex-none text-[9px] font-medium tracking-[0.1em] uppercase text-accent pt-[2px]">
                  {labels.entity}
                </span>
                <span className="text-[13px] leading-[1.6] text-muted">{selectedNode.type}</span>
              </div>
              <div className="bg-surface p-[13px_15px] flex gap-3">
                <span className="w-[78px] flex-none text-[9px] font-medium tracking-[0.1em] uppercase text-accent pt-[2px]">
                  slug
                </span>
                <span className="text-[13px] leading-[1.6] text-muted">{selectedNode.slug}</span>
              </div>
              {selectedNode.extra && (
                <div className="bg-surface p-[13px_15px] flex gap-3">
                  <span className="w-[78px] flex-none text-[9px] font-medium tracking-[0.1em] uppercase text-accent pt-[2px]">
                    {labels.collection}
                  </span>
                  <span className="text-[13px] leading-[1.6] text-muted">{selectedNode.extra}</span>
                </div>
              )}
              <div className="bg-surface p-[13px_15px] flex gap-3">
                <span className="w-[78px] flex-none text-[9px] font-medium tracking-[0.1em] uppercase text-accent pt-[2px]">
                  {labels.edges}
                </span>
                <span className="text-[13px] leading-[1.6] text-muted">{edgeCount}</span>
              </div>
            </div>
            {selectedNode.type === "question" && (
              <a
                href={`/${locale}/question/${selectedNode.slug}`}
                className="mt-auto p-[14px_18px] bg-gold text-[#090B0F] text-[11px] font-semibold tracking-[0.14em] uppercase text-center cursor-pointer hover:brightness-110 transition-all"
              >
                {labels.openQuestion}
              </a>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[13px] text-dim text-center leading-[1.7]">
              {labels.desc}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
