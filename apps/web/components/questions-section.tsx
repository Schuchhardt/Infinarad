import type { QuestionData } from "@/lib/data";
import { Link } from "@/i18n/navigation";

interface QuestionsSectionProps {
  questions: QuestionData[];
  sectionTitle: string;
}

export function QuestionsSection({
  questions,
  sectionTitle,
}: QuestionsSectionProps) {
  return (
    <section className="px-6 py-32" aria-labelledby="questions-heading">
      <div className="mx-auto max-w-4xl">
        <p
          id="questions-heading"
          className="mb-20 font-mono text-xs tracking-[0.3em] uppercase text-gold"
        >
          {sectionTitle}
        </p>

        <ol className="space-y-12 list-none p-0 m-0">
          {questions.map((q, i) => (
            <li key={q.id} className="group">
              <Link
                href={`/question/${q.slug}`}
                className="flex items-baseline gap-6"
              >
                <span
                  className="font-mono text-xs text-muted/60 tabular-nums"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2
                    className="font-display text-2xl leading-snug text-parchment group-hover:text-gold transition-colors md:text-4xl"
                    lang={q.is_fallback ? "en" : undefined}
                  >
                    {q.title}
                    {q.is_fallback && (
                      <span
                        className="ml-3 inline-block align-middle rounded border border-muted/30 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-muted"
                        title="Not yet translated"
                      >
                        EN
                      </span>
                    )}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                    {q.summary}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
