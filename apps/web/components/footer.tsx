interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const year = new Date().getFullYear();
  const descs: Record<string, string> = {
    en: "The living atlas of humanity's biggest questions. Documented, cited, never concluded.",
    es: "El atlas vivo de las grandes preguntas de la humanidad. Documentado, citado, nunca concluido.",
    pt: "O atlas vivo das maiores questões da humanidade. Documentado, citado, nunca concluído.",
    fr: "L'atlas vivant des plus grandes questions de l'humanité. Documenté, cité, jamais conclu.",
    de: "Der lebendige Atlas der größten Fragen der Menschheit. Dokumentiert, zitiert, nie abgeschlossen.",
    ar: "الأطلس الحي لأكبر أسئلة البشرية. موثق، مُستشهد، لا يُختتم أبدًا.",
    hi: "मानवता के सबसे बड़े प्रश्नों का जीवित मानचित्र। प्रलेखित, उद्धृत, कभी अंतिम नहीं।",
    zh: "人类最大问题的活地图集。有据可查，引用明确，永不定论。",
    ja: "人類の最大の問いの生きた地図帳。記録され、引用され、決して結論づけない。",
    he: "האטלס החי של השאלות הגדולות של האנושות. מתועד, מצוטט, לעולם לא סופי.",
  };
  const desc = descs[locale] ?? descs["en"]!;

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
