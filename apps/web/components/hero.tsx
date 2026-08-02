"use client";

import { useEffect, useState } from "react";

interface ScriptLine {
  text: string;
  script: string;
  dir: "ltr" | "rtl";
  lang: string;
}

const SCRIPT_LINES: ScriptLine[] = [
  {
    text: "What happens after death?",
    script: "Latin",
    dir: "ltr",
    lang: "en",
  },
  {
    text: "मृत्यु के बाद क्या होता है?",
    script: "Devanagari",
    dir: "ltr",
    lang: "hi",
  },
  {
    text: "ما الذي يحدث بعد الموت؟",
    script: "Arabic",
    dir: "rtl",
    lang: "ar",
  },
  { text: "死後はどうなるのか", script: "Japanese", dir: "ltr", lang: "ja" },
  { text: "Τι συμβαίνει μετά τον θάνατο;", script: "Greek", dir: "ltr", lang: "el" },
  {
    text: "מה קורה אחרי המוות?",
    script: "Hebrew",
    dir: "rtl",
    lang: "he",
  },
];

interface HeroProps {
  questionTitle: string;
  subtitle: string;
}

export function Hero({ questionTitle, subtitle }: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 py-24"
      aria-label={questionTitle}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink-light to-ink opacity-80" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-12" role="presentation">
          {prefersReducedMotion ? (
            <div className="space-y-4">
              {SCRIPT_LINES.map((line) => (
                <p
                  key={line.lang}
                  className="font-display text-2xl leading-relaxed text-parchment/70 md:text-3xl"
                  dir={line.dir}
                  lang={line.lang}
                >
                  {line.text}
                </p>
              ))}
            </div>
          ) : (
            <div className="relative h-[4.5rem] md:h-[5.5rem]">
              {SCRIPT_LINES.map((line, i) => (
                <p
                  key={line.lang}
                  className="script-line absolute inset-0 flex items-center justify-center font-display text-3xl leading-tight text-parchment transition-opacity duration-1000 md:text-5xl"
                  style={{
                    opacity: i === activeIndex ? 1 : 0,
                  }}
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

        <div className="mb-8 h-px w-24 mx-auto bg-gold/40" />

        <p className="font-display text-xl tracking-wide text-parchment/80 md:text-2xl">
          {subtitle}
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div
          className="h-8 w-px bg-gradient-to-b from-gold/60 to-transparent animate-pulse"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
