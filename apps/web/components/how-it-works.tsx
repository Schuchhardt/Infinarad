interface HowItWorksProps {
  sectionTitle: string;
  locale: string;
}

const STEPS: Record<string, { label: string; desc: string }[]> = {
  en: [
    { label: "Question", desc: "A universal question that every civilization has confronted." },
    { label: "Traditions", desc: "The documented answers from distinct philosophical and spiritual traditions." },
    { label: "Sources", desc: "Primary texts, academic works, and verifiable references for every claim." },
    { label: "Living Page", desc: "A continuously updated synthesis — cited, transparent, never concluded." },
  ],
  es: [
    { label: "Pregunta", desc: "Una pregunta universal que toda civilización ha enfrentado." },
    { label: "Tradiciones", desc: "Las respuestas documentadas de distintas tradiciones filosóficas y espirituales." },
    { label: "Fuentes", desc: "Textos primarios, obras académicas y referencias verificables para cada afirmación." },
    { label: "Página Viva", desc: "Una síntesis en actualización continua — citada, transparente, nunca concluyente." },
  ],
  pt: [
    { label: "Pergunta", desc: "Uma pergunta universal que toda civilização enfrentou." },
    { label: "Tradições", desc: "As respostas documentadas de distintas tradições filosóficas e espirituais." },
    { label: "Fontes", desc: "Textos primários, obras acadêmicas e referências verificáveis para cada afirmação." },
    { label: "Página Viva", desc: "Uma síntese em atualização contínua — citada, transparente, nunca conclusiva." },
  ],
  fr: [
    { label: "Question", desc: "Une question universelle à laquelle chaque civilisation a été confrontée." },
    { label: "Traditions", desc: "Les réponses documentées de traditions philosophiques et spirituelles distinctes." },
    { label: "Sources", desc: "Textes primaires, travaux académiques et références vérifiables pour chaque affirmation." },
    { label: "Page Vivante", desc: "Une synthèse continuellement mise à jour — citée, transparente, jamais conclue." },
  ],
  de: [
    { label: "Frage", desc: "Eine universelle Frage, mit der sich jede Zivilisation auseinandergesetzt hat." },
    { label: "Traditionen", desc: "Die dokumentierten Antworten aus verschiedenen philosophischen und spirituellen Traditionen." },
    { label: "Quellen", desc: "Primärtexte, akademische Werke und überprüfbare Referenzen für jede Aussage." },
    { label: "Lebende Seite", desc: "Eine kontinuierlich aktualisierte Synthese — zitiert, transparent, nie abgeschlossen." },
  ],
  ar: [
    { label: "السؤال", desc: "سؤال عالمي واجهته كل حضارة." },
    { label: "التقاليد", desc: "الإجابات الموثقة من تقاليد فلسفية وروحية مختلفة." },
    { label: "المصادر", desc: "نصوص أصلية وأعمال أكاديمية ومراجع يمكن التحقق منها لكل ادعاء." },
    { label: "الصفحة الحية", desc: "تركيب يُحدَّث باستمرار — موثق ومشفاف ولا يُختتم أبدًا." },
  ],
  hi: [
    { label: "प्रश्न", desc: "एक सार्वभौमिक प्रश्न जिसका सामना हर सभ्यता ने किया है।" },
    { label: "परंपराएँ", desc: "विभिन्न दार्शनिक और आध्यात्मिक परंपराओं के प्रलेखित उत्तर।" },
    { label: "स्रोत", desc: "प्राथमिक ग्रंथ, शैक्षणिक कार्य और हर दावे के लिए सत्यापन योग्य संदर्भ।" },
    { label: "जीवित पृष्ठ", desc: "एक निरंतर अद्यतन संश्लेषण — उद्धृत, पारदर्शी, कभी अंतिम नहीं।" },
  ],
  zh: [
    { label: "问题", desc: "每个文明都曾面对的普遍性问题。" },
    { label: "传统", desc: "来自不同哲学和精神传统的文献化答案。" },
    { label: "文献", desc: "原始文本、学术著作和每项论断的可验证参考。" },
    { label: "活页", desc: "一个持续更新的综合——有据可查、透明公开、永不定论。" },
  ],
  ja: [
    { label: "問い", desc: "あらゆる文明が直面してきた普遍的な問い。" },
    { label: "伝統", desc: "異なる哲学的・精神的伝統からの文献化された答え。" },
    { label: "典拠", desc: "原典、学術的著作、そしてすべての主張に対する検証可能な参照。" },
    { label: "生きたページ", desc: "絶えず更新される統合——引用され、透明で、決して結論づけない。" },
  ],
  he: [
    { label: "שאלה", desc: "שאלה אוניברסלית שכל ציוויליזציה התמודדה איתה." },
    { label: "מסורות", desc: "התשובות המתועדות ממסורות פילוסופיות ורוחניות שונות." },
    { label: "מקורות", desc: "טקסטים ראשוניים, עבודות אקדמיות וייחוסים ניתנים לאימות לכל טענה." },
    { label: "דף חי", desc: "סינתזה המתעדכנת ללא הרף — מצוטטת, שקופה, לעולם לא סופית." },
  ],
};

export function HowItWorks({ sectionTitle, locale }: HowItWorksProps) {
  const steps = STEPS[locale] ?? STEPS["en"]!;

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
