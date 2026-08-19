import { ScrollReveal } from "@/components/scroll-reveal";

interface TheRuleProps {
  locale: string;
}

const COPY: Record<string, { title: string; body: string }> = {
  en: { title: "We don't tell you what to believe.", body: "We show how humanity has searched for truth. No dogma. No ideology. Only documented perspectives." },
  es: { title: "No te decimos qué creer.", body: "Mostramos cómo la humanidad ha buscado la verdad. Sin dogma. Sin ideología. Solo perspectivas documentadas." },
  pt: { title: "Não dizemos no que acreditar.", body: "Mostramos como a humanidade buscou a verdade. Sem dogma. Sem ideologia. Apenas perspectivas documentadas." },
  fr: { title: "Nous ne vous disons pas quoi croire.", body: "Nous montrons comment l'humanité a cherché la vérité. Pas de dogme. Pas d'idéologie. Seulement des perspectives documentées." },
  de: { title: "Wir sagen Ihnen nicht, was Sie glauben sollen.", body: "Wir zeigen, wie die Menschheit nach Wahrheit gesucht hat. Kein Dogma. Keine Ideologie. Nur dokumentierte Perspektiven." },
  ar: { title: "لا نخبرك بما يجب أن تؤمن به.", body: "نُظهر كيف بحثت البشرية عن الحقيقة. لا عقائد. لا أيديولوجيا. فقط وجهات نظر موثقة." },
  hi: { title: "हम आपको नहीं बताते कि क्या मानें।", body: "हम दिखाते हैं कि मानवता ने सत्य की खोज कैसे की। कोई हठधर्मिता नहीं। कोई विचारधारा नहीं। केवल प्रलेखित दृष्टिकोण।" },
  zh: { title: "我们不告诉你该信什么。", body: "我们展示人类如何探寻真理。没有教条。没有意识形态。只有有据可查的视角。" },
  ja: { title: "何を信じるべきかは伝えません。", body: "人類がいかにして真理を探究してきたかを示します。教条なし。イデオロギーなし。文献化された視座のみ。" },
  he: { title: "אנחנו לא אומרים לך מה להאמין.", body: "אנחנו מראים כיצד האנושות חיפשה את האמת. ללא דוגמה. ללא אידיאולוגיה. רק פרספקטיבות מתועדות." },
};

export function TheRule({ locale }: TheRuleProps) {
  const c = COPY[locale] ?? COPY["en"]!;

  return (
    <section
      className="relative overflow-hidden bg-surface/60 py-20 text-center sm:py-28 lg:py-[132px]"
      aria-labelledby="rule-heading"
    >
      <div
        className="absolute pointer-events-none"
        style={{ inset: "-20%", background: "radial-gradient(ellipse 50% 60% at 30% 40%, rgba(80,108,134,0.10), transparent 60%)", animation: "drift 34s ease-in-out infinite" }}
      />

      <ScrollReveal className="relative z-10">
        <div className="section-container flex flex-col items-center">
          {/* Animated orb */}
          <div className="relative mb-8 h-[42px] w-[42px] sm:mb-11 sm:h-[52px] sm:w-[52px]">
            <div
              className="absolute inset-0 rounded-full"
              style={{ border: "1px solid rgba(198,166,107,0.35)", animation: "ring-out 4.5s ease-out infinite" }}
            />
            <div className="absolute rounded-full bg-gold" style={{ inset: "38%" }} />
          </div>

          <h2
            id="rule-heading"
            className="m-0 font-display text-[28px] font-medium leading-[1.25] tracking-[0.02em] sm:text-[38px] lg:text-5xl lg:leading-[1.14] lg:tracking-[0.04em]"
            style={{ textWrap: "pretty" }}
          >
            {c.title}
          </h2>

          <div className="my-6 h-px w-14 bg-gold/30 sm:my-8 sm:w-16" />

          <p className="m-0 max-w-[560px] text-[14px] leading-[1.7] text-muted sm:text-[15px] sm:leading-[1.75]">
            {c.body}
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
