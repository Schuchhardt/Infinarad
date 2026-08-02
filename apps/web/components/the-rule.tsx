interface TheRuleProps {
  title: string;
  body: string;
}

export function TheRule({ title, body }: TheRuleProps) {
  return (
    <section
      className="relative overflow-hidden bg-lapis/20 px-6 py-40"
      aria-labelledby="rule-heading"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-lapis/10 via-transparent to-gold/5" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p
          className="mb-16 font-mono text-xs tracking-[0.3em] uppercase text-gold"
          aria-hidden="true"
        >
          ·
        </p>

        <h2
          id="rule-heading"
          className="font-display text-3xl leading-tight text-parchment md:text-5xl"
        >
          {title}
        </h2>

        <div className="mx-auto mt-8 h-px w-16 bg-gold/40" />

        <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted">
          {body}
        </p>
      </div>
    </section>
  );
}
