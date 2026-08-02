interface HowItWorksProps {
  sectionTitle: string;
  locale: string;
}

const STEPS_EN = [
  {
    label: "Question",
    desc: "A universal question that every civilization has confronted.",
  },
  {
    label: "Traditions",
    desc: "The documented answers from distinct philosophical and spiritual traditions.",
  },
  {
    label: "Sources",
    desc: "Primary texts, academic works, and verifiable references for every claim.",
  },
  {
    label: "Living Page",
    desc: "A continuously updated synthesis — cited, transparent, never concluded.",
  },
];

const STEPS_ES = [
  {
    label: "Pregunta",
    desc: "Una pregunta universal que toda civilización ha enfrentado.",
  },
  {
    label: "Tradiciones",
    desc: "Las respuestas documentadas de distintas tradiciones filosóficas y espirituales.",
  },
  {
    label: "Fuentes",
    desc: "Textos primarios, obras académicas y referencias verificables para cada afirmación.",
  },
  {
    label: "Página Viva",
    desc: "Una síntesis en actualización continua — citada, transparente, nunca concluyente.",
  },
];

export function HowItWorks({ sectionTitle, locale }: HowItWorksProps) {
  const steps = locale === "es" ? STEPS_ES : STEPS_EN;

  return (
    <section
      className="bg-lapis/30 px-6 py-32"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-4xl">
        <p
          id="how-heading"
          className="mb-20 font-mono text-xs tracking-[0.3em] uppercase text-gold"
        >
          {sectionTitle}
        </p>

        <div className="grid gap-12 md:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.label} className="relative">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 font-mono text-xs text-gold">
                  {i + 1}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className="hidden flex-1 border-t border-dashed border-gold/20 md:block"
                    aria-hidden="true"
                  />
                )}
              </div>
              <h3 className="mb-2 font-display text-lg text-parchment">
                {step.label}
              </h3>
              <p className="text-sm leading-relaxed text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
