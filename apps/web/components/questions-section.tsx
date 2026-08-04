import type { QuestionData } from "@/lib/data";
import { Link } from "@/i18n/navigation";
import { ScrollReveal } from "@/components/scroll-reveal";

interface QuestionsSectionProps {
  questions: QuestionData[];
  sectionTitle: string;
  locale: string;
}

const CATEGORY_ORDER = ["existence", "life", "death", "ethics"] as const;
type CategoryKey = (typeof CATEGORY_ORDER)[number];

const QUESTION_CATEGORIES: Record<string, CategoryKey> = {
  "what-is-the-self": "existence",
  "what-is-consciousness": "existence",
  "what-is-the-nature-of-god": "existence",
  "how-did-the-world-begin": "existence",
  "what-is-the-purpose-of-life": "life",
  "do-we-have-free-will": "life",
  "what-is-the-nature-of-time": "life",
  "why-do-we-suffer": "life",
  "what-happens-after-death": "death",
  "what-is-good-and-evil": "ethics",
};

const CATEGORY_LABELS: Record<string, Record<CategoryKey, string>> = {
  en: { existence: "Existence", life: "Life", death: "Death", ethics: "Ethics" },
  es: { existence: "Existencia", life: "Vida", death: "Muerte", ethics: "Ética" },
  pt: { existence: "Existência", life: "Vida", death: "Morte", ethics: "Ética" },
  fr: { existence: "Existence", life: "Vie", death: "Mort", ethics: "Éthique" },
  de: { existence: "Existenz", life: "Leben", death: "Tod", ethics: "Ethik" },
  ar: { existence: "الوجود", life: "الحياة", death: "الموت", ethics: "الأخلاق" },
  hi: { existence: "अस्तित्व", life: "जीवन", death: "मृत्यु", ethics: "नैतिकता" },
  zh: { existence: "存在", life: "生命", death: "死亡", ethics: "伦理" },
  ja: { existence: "存在", life: "生", death: "死", ethics: "倫理" },
  he: { existence: "קיום", life: "חיים", death: "מוות", ethics: "אתיקה" },
};

export function QuestionsSection({ questions, sectionTitle, locale }: QuestionsSectionProps) {
  const labels = CATEGORY_LABELS[locale] ?? CATEGORY_LABELS["en"]!;

  const grouped = new Map<CategoryKey, QuestionData[]>();
  for (const cat of CATEGORY_ORDER) {
    grouped.set(cat, []);
  }
  for (const q of questions) {
    const cat = QUESTION_CATEGORIES[q.slug] ?? "life";
    grouped.get(cat)?.push(q);
  }

  return (
    <section className="section-container py-28" aria-labelledby="questions-heading">
      <ScrollReveal>
        <p
          id="questions-heading"
          className="mb-16 text-sm font-medium tracking-[0.3em] uppercase text-gold"
        >
          {sectionTitle}
        </p>
      </ScrollReveal>

      <div className="grid gap-14 md:grid-cols-2">
        {CATEGORY_ORDER.map((cat, catIdx) => {
          const items = grouped.get(cat);
          if (!items || items.length === 0) return null;
          return (
            <ScrollReveal key={cat} stagger={Math.min(catIdx + 1, 4)}>
              <div>
                <h3 className="mb-6 font-display text-xl font-medium text-text/40 md:text-2xl">
                  {labels[cat]}
                </h3>
                <ul className="m-0 list-none space-y-4 p-0">
                  {items.map((q) => (
                    <li key={q.id}>
                      <Link href={`/question/${q.slug}`} className="group block">
                        <p
                          className="font-display text-lg font-medium leading-snug tracking-[0.02em] text-text transition-colors duration-300 group-hover:text-gold md:text-xl"
                          lang={q.is_fallback ? "en" : undefined}
                        >
                          {q.title}
                          {q.is_fallback && (
                            <span
                              className="ms-2 inline-block rounded-[8px] border border-border px-1.5 py-0.5 align-middle text-[0.55rem] uppercase tracking-wider text-muted"
                              title="Not yet translated"
                            >
                              EN
                            </span>
                          )}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}
