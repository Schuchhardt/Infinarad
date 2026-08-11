"use client";

import { useEffect, useState } from "react";

interface LiveStatsProps {
  locale: string;
  traditions: number;
  concepts: number;
  sources: number;
  authors: number;
}

const LABELS: Record<string, {
  traditions: string;
  concepts: string;
  sources: string;
  authors: string;
}> = {
  en: { traditions: "Traditions", concepts: "Concepts", sources: "Sources", authors: "Authors" },
  es: { traditions: "Tradiciones", concepts: "Conceptos", sources: "Fuentes", authors: "Autores" },
  pt: { traditions: "Tradições", concepts: "Conceitos", sources: "Fontes", authors: "Autores" },
  fr: { traditions: "Traditions", concepts: "Concepts", sources: "Sources", authors: "Auteurs" },
  de: { traditions: "Traditionen", concepts: "Konzepte", sources: "Quellen", authors: "Autoren" },
  ar: { traditions: "تقاليد", concepts: "مفاهيم", sources: "مصادر", authors: "مؤلفون" },
  hi: { traditions: "परंपराएँ", concepts: "अवधारणाएँ", sources: "स्रोत", authors: "लेखक" },
  zh: { traditions: "传统", concepts: "概念", sources: "文献", authors: "作者" },
  ja: { traditions: "伝統", concepts: "概念", sources: "典拠", authors: "著者" },
  he: { traditions: "מסורות", concepts: "מושגים", sources: "מקורות", authors: "מחברים" },
};

export function LiveStats({ locale, traditions, concepts, sources, authors }: LiveStatsProps) {
  const l = LABELS[locale] ?? LABELS["en"]!;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t0 = Date.now();
    const timer = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / 1500);
      const eased = p < 1 ? 1 - Math.pow(1 - p, 3) : 1;
      setProgress(eased);
      if (p >= 1) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  const fmt = (n: number) => {
    const v = Math.round(n * progress);
    return v.toLocaleString(locale === "es" ? "es-CL" : "en-US");
  };

  const stats = [
    { value: traditions, label: l.traditions, delay: "0s" },
    { value: concepts, label: l.concepts, delay: "420ms" },
    { value: sources, label: l.sources, delay: "840ms" },
    { value: authors, label: l.authors, delay: "1260ms" },
  ];

  const hasData = stats.some((s) => s.value > 0);
  if (!hasData) return null;

  return (
    <section
      className="border-t border-b border-border bg-surface/50 py-14"
      aria-label="Statistics"
    >
      <div className="section-container flex justify-between gap-10 flex-wrap">
        {stats.filter((s) => s.value > 0).map((s) => (
          <div key={s.label} className="flex items-center gap-4">
            <div className="w-[34px] h-[34px] shrink-0 border border-border flex items-center justify-center">
              <div
                className="w-[9px] h-[9px] rounded-full bg-gold/50"
                style={{ animation: "pulse-glow 3.5s ease-in-out infinite", animationDelay: s.delay }}
              />
            </div>
            <div className="flex flex-col gap-[7px]">
              <span className="font-display text-[46px] leading-none tabular-nums">
                {fmt(s.value)}
              </span>
              <span className="text-[10.5px] font-medium tracking-[0.2em] uppercase text-muted">
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
