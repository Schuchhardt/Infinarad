interface TimelineProps {
  locale: string;
}

const ERAS = [
  { year: "3000 BCE", key: "egypt" },
  { year: "1500 BCE", key: "india" },
  { year: "600 BCE", key: "china" },
  { year: "500 BCE", key: "greece" },
  { year: "30 CE", key: "rome" },
  { year: "600 CE", key: "islam" },
  { year: "1200 CE", key: "medieval" },
  { year: "1600 CE", key: "science" },
  { year: "2025 CE", key: "now" },
];

const ERA_NAMES: Record<string, Record<string, string>> = {
  en: { egypt: "Egypt", india: "India", china: "China", greece: "Greece", rome: "Rome", islam: "Islam", medieval: "Medieval", science: "Modern Science", now: "Now" },
  es: { egypt: "Egipto", india: "India", china: "China", greece: "Grecia", rome: "Roma", islam: "Islam", medieval: "Medieval", science: "Ciencia Moderna", now: "Hoy" },
  pt: { egypt: "Egito", india: "Índia", china: "China", greece: "Grécia", rome: "Roma", islam: "Islã", medieval: "Medieval", science: "Ciência Moderna", now: "Agora" },
  fr: { egypt: "Égypte", india: "Inde", china: "Chine", greece: "Grèce", rome: "Rome", islam: "Islam", medieval: "Médiéval", science: "Science Moderne", now: "Aujourd'hui" },
  de: { egypt: "Ägypten", india: "Indien", china: "China", greece: "Griechenland", rome: "Rom", islam: "Islam", medieval: "Mittelalter", science: "Moderne Wissenschaft", now: "Heute" },
  ar: { egypt: "مصر", india: "الهند", china: "الصين", greece: "اليونان", rome: "روما", islam: "الإسلام", medieval: "العصور الوسطى", science: "العلم الحديث", now: "الآن" },
  hi: { egypt: "मिस्र", india: "भारत", china: "चीन", greece: "यूनान", rome: "रोम", islam: "इस्लाम", medieval: "मध्यकाल", science: "आधुनिक विज्ञान", now: "आज" },
  zh: { egypt: "埃及", india: "印度", china: "中国", greece: "希腊", rome: "罗马", islam: "伊斯兰", medieval: "中世纪", science: "现代科学", now: "现在" },
  ja: { egypt: "エジプト", india: "インド", china: "中国", greece: "ギリシャ", rome: "ローマ", islam: "イスラーム", medieval: "中世", science: "近代科学", now: "現在" },
  he: { egypt: "מצרים", india: "הודו", china: "סין", greece: "יוון", rome: "רומא", islam: "אסלאם", medieval: "ימי הביניים", science: "מדע מודרני", now: "עכשיו" },
};

const SECTION_LABELS: Record<string, string> = {
  en: "5,000 years of thought",
  es: "5.000 años de pensamiento",
  pt: "5.000 anos de pensamento",
  fr: "5 000 ans de pensée",
  de: "5.000 Jahre des Denkens",
  ar: "٥٠٠٠ سنة من الفكر",
  hi: "5,000 वर्षों का चिंतन",
  zh: "5000年的思想",
  ja: "5,000年の思索",
  he: "5,000 שנות מחשבה",
};

export function Timeline({ locale }: TimelineProps) {
  const names = ERA_NAMES[locale] ?? ERA_NAMES["en"]!;
  const sectionLabel = SECTION_LABELS[locale] ?? SECTION_LABELS["en"]!;

  return (
    <section className="px-6 py-24" aria-label={sectionLabel}>
      <div className="mx-auto max-w-4xl">
        <p className="mb-16 text-center font-mono text-xs tracking-[0.3em] uppercase text-gold">
          {sectionLabel}
        </p>

        <div className="relative">
          <div
            className="absolute top-0 bottom-0 start-[1.75rem] w-px bg-gradient-to-b from-gold/40 via-gold/20 to-transparent md:start-1/2"
            aria-hidden="true"
          />

          <div className="space-y-0">
            {ERAS.map((era, i) => {
              const isRight = i % 2 === 1;
              return (
                <div key={era.key} className="relative flex items-center py-4 md:py-5">
                  <div
                    className="absolute start-[1.75rem] z-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-gold/60 bg-ink md:start-1/2"
                    aria-hidden="true"
                  />

                  <div className={`ms-14 md:ms-0 md:w-1/2 ${isRight ? "md:ms-auto md:ps-12" : "md:pe-12 md:text-end"}`}>
                    <p className="font-mono text-xs text-gold/80">{era.year}</p>
                    <p className="font-display text-base text-parchment/80 md:text-lg">
                      {names[era.key] ?? era.key}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
