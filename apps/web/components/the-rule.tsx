interface TheRuleProps {
  locale: string;
}

const COPY: Record<string, { title: string; body: string }> = {
  en: {
    title: "We don't tell you what to believe.",
    body: "We show how humanity has searched for truth. No dogma. No ideology. Only documented perspectives.",
  },
  es: {
    title: "No te decimos qué creer.",
    body: "Mostramos cómo la humanidad ha buscado la verdad. Sin dogma. Sin ideología. Solo perspectivas documentadas.",
  },
  pt: {
    title: "Não dizemos no que acreditar.",
    body: "Mostramos como a humanidade buscou a verdade. Sem dogma. Sem ideologia. Apenas perspectivas documentadas.",
  },
  fr: {
    title: "Nous ne vous disons pas quoi croire.",
    body: "Nous montrons comment l'humanité a cherché la vérité. Pas de dogme. Pas d'idéologie. Seulement des perspectives documentées.",
  },
  de: {
    title: "Wir sagen Ihnen nicht, was Sie glauben sollen.",
    body: "Wir zeigen, wie die Menschheit nach Wahrheit gesucht hat. Kein Dogma. Keine Ideologie. Nur dokumentierte Perspektiven.",
  },
  ar: {
    title: "لا نخبرك بما يجب أن تؤمن به.",
    body: "نُظهر كيف بحثت البشرية عن الحقيقة. لا عقائد. لا أيديولوجيا. فقط وجهات نظر موثقة.",
  },
  hi: {
    title: "हम आपको नहीं बताते कि क्या मानें।",
    body: "हम दिखाते हैं कि मानवता ने सत्य की खोज कैसे की। कोई हठधर्मिता नहीं। कोई विचारधारा नहीं। केवल प्रलेखित दृष्टिकोण।",
  },
  zh: {
    title: "我们不告诉你该信什么。",
    body: "我们展示人类如何探寻真理。没有教条。没有意识形态。只有有据可查的视角。",
  },
  ja: {
    title: "何を信じるべきかは伝えません。",
    body: "人類がいかにして真理を探究してきたかを示します。教条なし。イデオロギーなし。文献化された視座のみ。",
  },
  he: {
    title: "אנחנו לא אומרים לך מה להאמין.",
    body: "אנחנו מראים כיצד האנושות חיפשה את האמת. ללא דוגמה. ללא אידיאולוגיה. רק פרספקטיבות מתועדות.",
  },
};

export function TheRule({ locale }: TheRuleProps) {
  const c = COPY[locale] ?? COPY["en"]!;

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
          {c.title}
        </h2>

        <div className="mx-auto mt-8 h-px w-16 bg-gold/40" />

        <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted">
          {c.body}
        </p>
      </div>
    </section>
  );
}
