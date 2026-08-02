interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const year = new Date().getFullYear();
  const descs: Record<string, string> = {
    en: "Documenting how humanity has answered the great questions. No conclusions.",
    es: "Documentamos cómo la humanidad ha respondido las grandes preguntas. Sin conclusiones.",
    pt: "Documentando como a humanidade respondeu às grandes questões. Sem conclusões.",
    fr: "Documenter comment l'humanité a répondu aux grandes questions. Sans conclusions.",
    de: "Dokumentieren, wie die Menschheit die großen Fragen beantwortet hat. Ohne Schlussfolgerungen.",
    ar: "نوثّق كيف أجابت البشرية على الأسئلة الكبرى. بلا استنتاجات.",
    hi: "मानवता ने महान प्रश्नों का उत्तर कैसे दिया, इसका प्रलेखन। कोई निष्कर्ष नहीं।",
    zh: "记录人类如何回答伟大的问题。不下结论。",
    ja: "人類がいかにして大いなる問いに答えてきたかを記録する。結論なし。",
    he: "מתעדים כיצד האנושות ענתה על השאלות הגדולות. ללא מסקנות.",
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
