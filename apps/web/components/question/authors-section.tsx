import type { RelatedAuthor } from "@/lib/questions";
import { SectionHeading } from "./section-heading";

interface AuthorsSectionProps {
  authors: RelatedAuthor[];
  title: string;
}

function formatLifespan(birth: number | null, death: number | null): string {
  if (!birth && !death) return "";
  const b = birth ? (birth < 0 ? `${Math.abs(birth)} BCE` : `${birth}`) : "?";
  const d = death ? (death < 0 ? `${Math.abs(death)} BCE` : `${death}`) : "";
  return d ? `${b} – ${d}` : `b. ${b}`;
}

export function AuthorsSection({ authors, title }: AuthorsSectionProps) {
  if (authors.length === 0) return null;

  return (
    <section className="px-6 py-16" aria-labelledby="authors-heading">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          id="authors-heading"
          title={title}
          count={authors.length}
        />
        <div className="space-y-6">
          {authors.map((a) => (
            <div
              key={a.id}
              className="flex items-baseline gap-6 border-b border-parchment/6 pb-6 last:border-0"
            >
              <div className="flex-1">
                <h3
                  className="font-display text-lg text-parchment"
                  lang={a.is_fallback ? "en" : undefined}
                >
                  {a.name}
                </h3>
                {a.summary && (
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {a.summary}
                  </p>
                )}
              </div>
              {(a.birth_year || a.death_year) && (
                <span className="shrink-0 font-mono text-xs text-muted/50">
                  {formatLifespan(a.birth_year, a.death_year)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
