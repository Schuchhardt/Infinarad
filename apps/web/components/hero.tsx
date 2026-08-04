"use client";

import { useEffect, useState } from "react";

interface ScriptLine {
  text: string;
  dir: "ltr" | "rtl";
  lang: string;
}

const SCRIPT_LINES: ScriptLine[] = [
  { text: "What happens after death?", dir: "ltr", lang: "en" },
  { text: "मृत्यु के बाद क्या होता है?", dir: "ltr", lang: "hi" },
  { text: "ما الذي يحدث بعد الموت؟", dir: "rtl", lang: "ar" },
  { text: "死後はどうなるのか", dir: "ltr", lang: "ja" },
  { text: "Τι συμβαίνει μετά τον θάνατο;", dir: "ltr", lang: "el" },
  { text: "מה קורה אחרי המוות?", dir: "rtl", lang: "he" },
  { text: "O que acontece após a morte?", dir: "ltr", lang: "pt" },
  { text: "Was geschieht nach dem Tod?", dir: "ltr", lang: "de" },
];

const HERO_COPY: Record<string, { line1: string; line2: string; line3: string }> = {
  en: {
    line1: "Every culture searched for meaning.",
    line2: "Every civilization left answers.",
    line3: "For the first time, they're connected in one place.",
  },
  es: {
    line1: "Cada cultura buscó un sentido.",
    line2: "Cada civilización dejó respuestas.",
    line3: "Por primera vez, están conectadas en un solo lugar.",
  },
  pt: {
    line1: "Cada cultura buscou um sentido.",
    line2: "Cada civilização deixou respostas.",
    line3: "Pela primeira vez, estão conectadas em um só lugar.",
  },
  fr: {
    line1: "Chaque culture a cherché un sens.",
    line2: "Chaque civilisation a laissé des réponses.",
    line3: "Pour la première fois, elles sont connectées en un seul lieu.",
  },
  de: {
    line1: "Jede Kultur suchte nach Sinn.",
    line2: "Jede Zivilisation hinterließ Antworten.",
    line3: "Zum ersten Mal sind sie an einem Ort verbunden.",
  },
  ar: {
    line1: "كل ثقافة بحثت عن المعنى.",
    line2: "كل حضارة تركت إجابات.",
    line3: "للمرة الأولى، أصبحت مترابطة في مكان واحد.",
  },
  hi: {
    line1: "हर संस्कृति ने अर्थ की खोज की।",
    line2: "हर सभ्यता ने उत्तर छोड़े।",
    line3: "पहली बार, वे एक ही स्थान पर जुड़े हैं।",
  },
  zh: {
    line1: "每种文化都在寻找意义。",
    line2: "每个文明都留下了答案。",
    line3: "它们第一次被连接在一个地方。",
  },
  ja: {
    line1: "あらゆる文化が意味を探した。",
    line2: "あらゆる文明が答えを残した。",
    line3: "初めて、それらが一つの場所に結ばれる。",
  },
  he: {
    line1: "כל תרבות חיפשה משמעות.",
    line2: "כל ציוויליזציה השאירה תשובות.",
    line3: "לראשונה, הן מחוברות במקום אחד.",
  },
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const copy = HERO_COPY[locale] ?? HERO_COPY["en"]!;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SCRIPT_LINES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center"
      aria-label="Infinarad"
    >
      <div className="hero-bg">
        {CONSTELLATION_DOTS.map((dot, i) => (
          <span
            key={i}
            className="constellation-dot"
            style={{ top: dot.top, left: dot.left, animationDelay: dot.delay }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-8 text-center lg:px-[120px]">
        <p
          className="mb-6 animate-fade-in text-sm font-medium tracking-[0.3em] uppercase text-gold"
          style={{ animationDelay: "200ms" }}
        >
          Infinarad
        </p>

        <p
          className="mb-14 animate-fade-in font-display text-base font-medium tracking-[0.1em] text-text/50 md:text-lg"
          style={{ animationDelay: "400ms" }}
        >
          {descriptor}
        </p>

        <div className="mb-10 animate-fade-in space-y-3" style={{ animationDelay: "600ms" }}>
          <p className="font-display text-2xl font-medium leading-relaxed tracking-[0.04em] text-text/85 md:text-4xl">
            {copy.line1}
          </p>
          <p className="font-display text-2xl font-medium leading-relaxed tracking-[0.04em] text-text md:text-4xl">
            {copy.line2}
          </p>
        </div>

        <div
          className="mx-auto mb-10 h-px w-24 animate-fade-in bg-gold/30"
          style={{ animationDelay: "800ms" }}
        />

        <p
          className="animate-fade-in font-display text-lg font-medium tracking-[0.04em] text-text/60 md:text-xl"
          style={{ animationDelay: "1000ms" }}
        >
          {copy.line3}
        </p>

        <div className="mt-20 animate-fade-in" role="presentation" style={{ animationDelay: "1200ms" }}>
          {prefersReducedMotion ? (
            <div className="space-y-3">
              {SCRIPT_LINES.slice(0, 4).map((line) => (
                <p
                  key={line.lang}
                  className="font-display text-lg leading-relaxed text-text/20 md:text-xl"
                  dir={line.dir}
                  lang={line.lang}
                >
                  {line.text}
                </p>
              ))}
            </div>
          ) : (
            <div className="relative h-[3rem] md:h-[3.5rem]">
              {SCRIPT_LINES.map((line, i) => (
                <p
                  key={line.lang}
                  className="script-line absolute inset-0 flex items-center justify-center font-display text-xl leading-tight text-text/25 transition-opacity duration-1000 md:text-2xl"
                  style={{ opacity: i === activeIndex ? 1 : 0 }}
                  dir={line.dir}
                  lang={line.lang}
                  aria-hidden={i !== activeIndex}
                >
                  {line.text}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div
          className="h-10 w-px bg-gradient-to-b from-gold/40 to-transparent"
          aria-hidden="true"
          style={{ animation: "pulse-glow 3s ease-in-out infinite" }}
        />
      </div>
    </section>
  );
}
