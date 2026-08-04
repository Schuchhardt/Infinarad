import { ScrollReveal } from "@/components/scroll-reveal";

interface LiveStatsProps {
  locale: string;
  traditions: number;
  concepts: number;
  sources: number;
  authors: number;
}

const LABELS: Record<string, {
  currently: string;
  traditions: string;
  concepts: string;
  sources: string;
  thinkers: string;
  growing: string;
}> = {
  en: { currently: "Currently documenting", traditions: "Traditions", concepts: "Concepts", sources: "Sources", thinkers: "Historical Figures", growing: "Growing every week." },
  es: { currently: "Actualmente documentando", traditions: "Tradiciones", concepts: "Conceptos", sources: "Fuentes", thinkers: "Figuras Históricas", growing: "Creciendo cada semana." },
  pt: { currently: "Atualmente documentando", traditions: "Tradições", concepts: "Conceitos", sources: "Fontes", thinkers: "Figuras Históricas", growing: "Crescendo toda semana." },
  fr: { currently: "Actuellement documenté", traditions: "Traditions", concepts: "Concepts", sources: "Sources", thinkers: "Figures Historiques", growing: "En croissance chaque semaine." },
  de: { currently: "Aktuell dokumentiert", traditions: "Traditionen", concepts: "Konzepte", sources: "Quellen", thinkers: "Historische Persönlichkeiten", growing: "Wächst jede Woche." },
  ar: { currently: "نوثّق حاليًا", traditions: "تقليد", concepts: "مفهوم", sources: "مصدر", thinkers: "شخصية تاريخية", growing: "ينمو كل أسبوع." },
  hi: { currently: "वर्तमान में प्रलेखित", traditions: "परंपराएँ", concepts: "अवधारणाएँ", sources: "स्रोत", thinkers: "ऐतिहासिक विभूतियाँ", growing: "हर सप्ताह बढ़ रहा है।" },
  zh: { currently: "目前已记录", traditions: "个传统", concepts: "个概念", sources: "份文献", thinkers: "位历史人物", growing: "每周持续增长。" },
  ja: { currently: "現在記録中", traditions: "の伝統", concepts: "の概念", sources: "の典拠", thinkers: "の歴史的人物", growing: "毎週成長中。" },
  he: { currently: "כרגע מתעדים", traditions: "מסורות", concepts: "מושגים", sources: "מקורות", thinkers: "דמויות היסטוריות", growing: "גדל כל שבוע." },
};

export function LiveStats({ locale, traditions, concepts, sources, authors }: LiveStatsProps) {
  const l = LABELS[locale] ?? LABELS["en"]!;

  const stats = [
    { value: traditions, label: l.traditions },
    { value: concepts, label: l.concepts },
    { value: sources, label: l.sources },
    { value: authors, label: l.thinkers },
  ];

  const hasData = stats.some((s) => s.value > 0);
  if (!hasData) return null;

  return (
    <section className="section-container py-20" aria-label={l.currently}>
      <ScrollReveal>
        <div className="text-center">
          <p className="mb-10 text-xs font-medium tracking-[0.3em] uppercase text-muted/60">
            {l.currently}
          </p>

          <div className="flex flex-wrap justify-center gap-10 md:gap-16">
            {stats.filter((s) => s.value > 0).map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-medium text-text md:text-4xl">
                  {s.value.toLocaleString()}
                </p>
                <p className="mt-1.5 text-xs tracking-wider text-muted/50">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-xs text-gold/60">{l.growing}</p>
        </div>
      </ScrollReveal>
    </section>
  );
}
