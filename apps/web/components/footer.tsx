interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const year = new Date().getFullYear();
  const desc =
    locale === "es"
      ? "Documentamos cómo la humanidad ha respondido las grandes preguntas. Sin conclusiones."
      : "Documenting how humanity has answered the great questions. No conclusions.";

  return (
    <footer className="border-t border-parchment/8 px-6 py-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-parchment/60">
          Infinarad
        </span>
        <p className="max-w-md text-sm leading-relaxed text-muted">{desc}</p>
        <p className="font-mono text-[0.65rem] text-muted/50">
          © {year} Infinarad
        </p>
      </div>
    </footer>
  );
}
