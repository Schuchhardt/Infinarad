import { ScrollReveal } from "@/components/scroll-reveal";

interface HowItWorksProps {
  sectionTitle: string;
  locale: string;
}

const STEPS: Record<string, { label: string; desc: string }[]> = {
  en: [
    { label: "Question", desc: "A universal question that every civilization has confronted." },
    { label: "Perspectives", desc: "The documented perspectives from distinct philosophical, spiritual, and scientific traditions." },
    { label: "Sources", desc: "Primary texts, academic works, and verifiable references for every claim." },
    { label: "Connections", desc: "Cross-tradition links revealing how ideas influenced each other across millennia." },
    { label: "Living Knowledge", desc: "A continuously updated synthesis — cited, transparent, never concluded." },
  ],
  es: [
    { label: "Pregunta", desc: "Una pregunta universal que toda civilización ha enfrentado." },
    { label: "Perspectivas", desc: "Las perspectivas documentadas de distintas tradiciones filosóficas, espirituales y científicas." },
    { label: "Fuentes", desc: "Textos primarios, obras académicas y referencias verificables para cada afirmación." },
    { label: "Conexiones", desc: "Vínculos entre tradiciones que revelan cómo las ideas se influenciaron mutuamente a lo largo de milenios." },
    { label: "Conocimiento Vivo", desc: "Una síntesis en actualización continua — citada, transparente, nunca concluyente." },
  ],
  pt: [
    { label: "Pergunta", desc: "Uma pergunta universal que toda civilização enfrentou." },
    { label: "Perspectivas", desc: "As perspectivas documentadas de distintas tradições filosóficas, espirituais e científicas." },
    { label: "Fontes", desc: "Textos primários, obras acadêmicas e referências verificáveis para cada afirmação." },
    { label: "Conexões", desc: "Vínculos entre tradições revelando como as ideias se influenciaram ao longo de milênios." },
    { label: "Conhecimento Vivo", desc: "Uma síntese em atualização contínua — citada, transparente, nunca conclusiva." },
  ],
  fr: [
    { label: "Question", desc: "Une question universelle à laquelle chaque civilisation a été confrontée." },
    { label: "Perspectives", desc: "Les perspectives documentées de traditions philosophiques, spirituelles et scientifiques distinctes." },
    { label: "Sources", desc: "Textes primaires, travaux académiques et références vérifiables pour chaque affirmation." },
    { label: "Connexions", desc: "Des liens entre traditions révélant comment les idées se sont influencées à travers les millénaires." },
    { label: "Savoir Vivant", desc: "Une synthèse continuellement mise à jour — citée, transparente, jamais conclue." },
  ],
  de: [
    { label: "Frage", desc: "Eine universelle Frage, mit der sich jede Zivilisation auseinandergesetzt hat." },
    { label: "Perspektiven", desc: "Die dokumentierten Perspektiven aus verschiedenen philosophischen, spirituellen und wissenschaftlichen Traditionen." },
    { label: "Quellen", desc: "Primärtexte, akademische Werke und überprüfbare Referenzen für jede Aussage." },
    { label: "Verbindungen", desc: "Traditionsübergreifende Verknüpfungen, die zeigen, wie sich Ideen über Jahrtausende gegenseitig beeinflussten." },
    { label: "Lebendiges Wissen", desc: "Eine kontinuierlich aktualisierte Synthese — zitiert, transparent, nie abgeschlossen." },
  ],
  ar: [
    { label: "السؤال", desc: "سؤال عالمي واجهته كل حضارة." },
    { label: "وجهات النظر", desc: "الآراء الموثقة من تقاليد فلسفية وروحية وعلمية مختلفة." },
    { label: "المصادر", desc: "نصوص أصلية وأعمال أكاديمية ومراجع يمكن التحقق منها لكل ادعاء." },
    { label: "الروابط", desc: "روابط بين التقاليد تكشف كيف أثرت الأفكار على بعضها عبر الألفيات." },
    { label: "المعرفة الحية", desc: "تركيب يُحدَّث باستمرار — موثق ومشفاف ولا يُختتم أبدًا." },
  ],
  hi: [
    { label: "प्रश्न", desc: "एक सार्वभौमिक प्रश्न जिसका सामना हर सभ्यता ने किया है।" },
    { label: "दृष्टिकोण", desc: "विभिन्न दार्शनिक, आध्यात्मिक और वैज्ञानिक परंपराओं के प्रलेखित दृष्टिकोण।" },
    { label: "स्रोत", desc: "प्राथमिक ग्रंथ, शैक्षणिक कार्य और हर दावे के लिए सत्यापन योग्य संदर्भ।" },
    { label: "संबंध", desc: "परंपराओं के बीच के संबंध जो दर्शाते हैं कि विचारों ने सहस्राब्दियों में एक-दूसरे को कैसे प्रभावित किया।" },
    { label: "जीवित ज्ञान", desc: "एक निरंतर अद्यतन संश्लेषण — उद्धृत, पारदर्शी, कभी अंतिम नहीं।" },
  ],
  zh: [
    { label: "问题", desc: "每个文明都曾面对的普遍性问题。" },
    { label: "视角", desc: "来自不同哲学、精神和科学传统的文献化观点。" },
    { label: "文献", desc: "原始文本、学术著作和每项论断的可验证参考。" },
    { label: "关联", desc: "跨传统的联系，揭示思想如何在千年间相互影响。" },
    { label: "活知识", desc: "一个持续更新的综合——有据可查、透明公开、永不定论。" },
  ],
  ja: [
    { label: "問い", desc: "あらゆる文明が直面してきた普遍的な問い。" },
    { label: "視座", desc: "異なる哲学的・精神的・科学的伝統からの文献化された視点。" },
    { label: "典拠", desc: "原典、学術的著作、そしてすべての主張に対する検証可能な参照。" },
    { label: "つながり", desc: "伝統を越えた結びつきが、思想が千年にわたってどう影響し合ったかを明らかにする。" },
    { label: "生きた知", desc: "絶えず更新される統合——引用され、透明で、決して結論づけない。" },
  ],
  he: [
    { label: "שאלה", desc: "שאלה אוניברסלית שכל ציוויליזציה התמודדה איתה." },
    { label: "נקודות מבט", desc: "הפרספקטיבות המתועדות ממסורות פילוסופיות, רוחניות ומדעיות שונות." },
    { label: "מקורות", desc: "טקסטים ראשוניים, עבודות אקדמיות וייחוסים ניתנים לאימות לכל טענה." },
    { label: "קשרים", desc: "קישורים חוצי-מסורות החושפים כיצד רעיונות השפיעו זה על זה לאורך אלפי שנים." },
    { label: "ידע חי", desc: "סינתזה המתעדכנת ללא הרף — מצוטטת, שקופה, לעולם לא סופית." },
  ],
};

export function HowItWorks({ sectionTitle, locale }: HowItWorksProps) {
  const steps = STEPS[locale] ?? STEPS["en"]!;

  return (
    <section className="bg-surface/80 py-28" aria-labelledby="how-heading">
      <div className="section-container">
        <ScrollReveal>
          <p
            id="how-heading"
            className="mb-16 text-sm font-medium tracking-[0.3em] uppercase text-gold"
          >
            {sectionTitle}
          </p>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-5">
          {steps.map((step, i) => (
            <ScrollReveal key={step.label} stagger={Math.min(i + 1, 5)}>
              <div className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 text-xs font-medium text-gold">
                    {i + 1}
                  </span>
                  {i < steps.length - 1 && (
                    <div
                      className="hidden flex-1 border-t border-dashed border-border md:block"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <h3 className="mb-2 font-display text-lg font-medium text-text">
                  {step.label}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{step.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
