"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ScriptLine {
  text: string;
  dir: "ltr" | "rtl";
}

const SCRIPT_LINES: ScriptLine[] = [
  { text: "What happens after death?", dir: "ltr" },
  { text: "मृत्यु के बाद क्या होता है?", dir: "ltr" },
  { text: "ما الذي يحدث بعد الموت؟", dir: "rtl" },
  { text: "死後はどうなるのか", dir: "ltr" },
  { text: "Τι συμβαίνει μετά τον θάνατο;", dir: "ltr" },
  { text: "מה קורה אחרי המוות?", dir: "rtl" },
  { text: "O que acontece após a morte?", dir: "ltr" },
  { text: "Was geschieht nach dem Tod?", dir: "ltr" },
];

const HERO_COPY: Record<string, { line1: string; line2: string; line3: string }> = {
  en: { line1: "Every culture searched for meaning.", line2: "Every civilization left answers.", line3: "For the first time, they're connected in one place." },
  es: { line1: "Cada cultura buscó un sentido.", line2: "Cada civilización dejó respuestas.", line3: "Por primera vez, están conectadas en un solo lugar." },
  pt: { line1: "Cada cultura buscou um sentido.", line2: "Cada civilização deixou respostas.", line3: "Pela primeira vez, estão conectadas em um só lugar." },
  fr: { line1: "Chaque culture a cherché un sens.", line2: "Chaque civilisation a laissé des réponses.", line3: "Pour la première fois, elles sont connectées en un seul lieu." },
  de: { line1: "Jede Kultur suchte nach Sinn.", line2: "Jede Zivilisation hinterließ Antworten.", line3: "Zum ersten Mal sind sie an einem Ort verbunden." },
  ar: { line1: "كل ثقافة بحثت عن المعنى.", line2: "كل حضارة تركت إجابات.", line3: "للمرة الأولى، أصبحت مترابطة في مكان واحد." },
  hi: { line1: "हर संस्कृति ने अर्थ की खोज की।", line2: "हर सभ्यता ने उत्तर छोड़े।", line3: "पहली बार, वे एक ही स्थान पर जुड़े हैं।" },
  zh: { line1: "每种文化都在寻找意义。", line2: "每个文明都留下了答案。", line3: "它们第一次被连接在一个地方。" },
  ja: { line1: "あらゆる文化が意味を探した。", line2: "あらゆる文明が答えを残した。", line3: "初めて、それらが一つの場所に結ばれる。" },
  he: { line1: "כל תרבות חיפשה משמעות.", line2: "כל ציוויליזציה השאירה תשובות.", line3: "לראשונה, הן מחוברות במקום אחד." },
};

const CONSTELLATION_DOTS = [
  { top: "12%", left: "15%", delay: "0s" },
  { top: "25%", left: "78%", delay: "1.2s" },
  { top: "45%", left: "8%", delay: "0.6s" },
  { top: "60%", left: "88%", delay: "2.4s" },
  { top: "18%", left: "45%", delay: "1.8s" },
  { top: "72%", left: "32%", delay: "0.3s" },
  { top: "35%", left: "62%", delay: "3.0s" },
  { top: "80%", left: "72%", delay: "1.5s" },
  { top: "8%", left: "90%", delay: "2.1s" },
  { top: "55%", left: "50%", delay: "0.9s" },
  { top: "90%", left: "20%", delay: "2.7s" },
  { top: "40%", left: "25%", delay: "3.3s" },
];

interface HeroProps {
  locale: string;
  descriptor: string;
}

export function Hero({ locale, descriptor }: HeroProps) {
  const [scriptIdx, setScriptIdx] = useState(0);
  const copy = HERO_COPY[locale] ?? HERO_COPY["en"]!;
  const sc = SCRIPT_LINES[scriptIdx]!;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const interval = setInterval(() => {
      setScriptIdx((prev) => (prev + 1) % SCRIPT_LINES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden px-5 pt-14 pb-16 text-center sm:px-10 sm:pt-[88px] sm:pb-20 lg:px-[60px] lg:pt-[104px] lg:pb-[88px]">
      {/* Background gradients */}
      <div
        className="absolute pointer-events-none"
        style={{ inset: "-10%", background: "radial-gradient(ellipse 60% 50% at 50% 25%, rgba(80,108,134,0.12) 0%, transparent 62%)", animation: "drift 26s ease-in-out infinite" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 45% at 22% 82%, rgba(198,166,107,0.07) 0%, transparent 55%)" }}
      />

      {/* Constellation dots */}
      {CONSTELLATION_DOTS.map((dot, i) => (
        <span
          key={i}
          className="constellation-dot"
          style={{ top: dot.top, left: dot.left, animationDelay: dot.delay }}
          aria-hidden="true"
        />
      ))}

      {/* Spinning logo orb */}
      <div className="relative mx-auto mb-8 h-[124px] w-[124px] animate-fade-in sm:mb-10 sm:h-[152px] sm:w-[152px] lg:h-[184px] lg:w-[184px]">
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: "1px solid rgba(198,166,107,0.16)", animation: "spin-slow 60s linear infinite" }}
        />
        <div
          className="absolute rounded-full"
          style={{ inset: "13%", border: "1px dashed rgba(80,108,134,0.3)", animation: "spin-reverse 44s linear infinite" }}
        />
        <div
          className="absolute rounded-full"
          style={{ inset: "7%", border: "1px solid rgba(198,166,107,0.2)", animation: "ring-out 5.5s ease-out infinite" }}
        />
        <Image
          src="/logo/infinarad_yellow-transparent.png"
          alt=""
          width={184}
          height={184}
          sizes="184px"
          className="absolute inset-[22px] h-auto w-[calc(100%-44px)] object-contain opacity-90 sm:inset-[28px] sm:w-[calc(100%-56px)] lg:inset-[34px] lg:w-[calc(100%-68px)]"
          style={{ animation: "spin-slow 220s linear infinite" }}
        />
      </div>

      {/* Content */}
      <div className="relative max-w-[860px] mx-auto flex flex-col items-center">
        <p
          className="mb-4 text-[11px] font-medium tracking-[0.28em] uppercase text-gold animate-fade-up sm:mb-[22px] sm:text-[13px] sm:tracking-[0.3em]"
        >
          Infinarad
        </p>

        <p
          className="mb-9 font-display text-[15px] font-medium tracking-[0.08em] text-text/50 animate-fade-up sm:mb-[52px] sm:text-[19px] sm:tracking-[0.1em]"
          style={{ animationDelay: "120ms" }}
        >
          {descriptor}
        </p>

        <p
          className="m-0 mb-2 font-display text-[26px] font-medium leading-[1.35] tracking-[0.02em] text-text/85 animate-fade-up sm:mb-3 sm:text-[32px] sm:tracking-[0.04em] lg:text-[40px] lg:leading-[1.4]"
          style={{ animationDelay: "240ms", textWrap: "pretty" }}
        >
          {copy.line1}
        </p>
        <p
          className="m-0 mb-7 font-display text-[26px] font-medium leading-[1.35] tracking-[0.02em] animate-fade-up sm:mb-9 sm:text-[32px] sm:tracking-[0.04em] lg:text-[40px] lg:leading-[1.4]"
          style={{ animationDelay: "340ms", textWrap: "pretty" }}
        >
          {copy.line2}
        </p>

        {/* Sweep line */}
        <div className="relative mb-7 h-px w-20 overflow-hidden bg-gold/25 sm:mb-9 sm:w-24">
          <div
            className="absolute top-0 left-0 h-px bg-gold"
            style={{ width: "40%", animation: "sweep 4s ease-in-out infinite" }}
          />
        </div>

        <p
          className="m-0 mb-10 font-display text-[16px] font-medium leading-[1.5] tracking-[0.02em] text-text/60 animate-fade-up sm:mb-[60px] sm:text-[21px] sm:tracking-[0.04em]"
          style={{ animationDelay: "460ms" }}
        >
          {copy.line3}
        </p>

        {/* Script rotation */}
        <p
          key={`sl${scriptIdx}`}
          className="m-0 min-h-[52px] font-display text-[19px] leading-[1.35] text-text/25 animate-fade-in sm:min-h-[36px] sm:text-[26px] sm:leading-[1.3]"
          dir={sc.dir}
        >
          {sc.text}
        </p>
      </div>
    </section>
  );
}
