import type { SourceData } from "@/lib/questions";
import { SectionHeading } from "./section-heading";

interface SourcesSectionProps {
  sources: SourceData[];
  title: string;
}

function formatSourceRef(s: SourceData): string {
  const parts: string[] = [];
  if (s.author_name) parts.push(s.author_name);
  if (s.year) parts.push(`(${s.year})`);
  parts.push(s.title);
  if (s.publisher) parts.push(s.publisher);
  return parts.join(". ") + ".";
}

export function SourcesSection({ sources, title }: SourcesSectionProps) {
  if (sources.length === 0) return null;

  return (
    <section
      className="bg-lapis/10 px-6 py-16"
      aria-labelledby="sources-heading"
    >
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          id="sources-heading"
          title={title}
          count={sources.length}
        />
        <ol className="list-none space-y-8 p-0">
          {sources.map((s, i) => (
            <li key={`${s.id}-${i}`} className="border-b border-parchment/6 pb-6 last:border-0">
              <div className="flex items-start gap-4">
                <span className="mt-1 shrink-0 font-mono text-xs text-muted/40 tabular-nums">
                  [{i + 1}]
                </span>
                <div className="flex-1">
                  <p className="text-sm text-parchment/90">
                    {formatSourceRef(s)}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    <span className="font-mono text-[0.65rem] uppercase tracking-wider text-gold/50">
                      {s.kind.replace("_", " ")}
                    </span>
                    {" · "}
                    {s.locator}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted/80">
                    {s.claim_text}
                  </p>
                  {s.quote && (
                    <blockquote className="mt-3 border-s-2 border-gold/30 ps-4 font-display text-sm italic text-parchment/70">
                      &ldquo;{s.quote}&rdquo;
                    </blockquote>
                  )}
                  {(s.doi || s.url_canonical || s.isbn) && (
                    <div className="mt-2 flex flex-wrap gap-3 font-mono text-[0.6rem] text-muted/50">
                      {s.doi && <span>DOI: {s.doi}</span>}
                      {s.isbn && <span>ISBN: {s.isbn}</span>}
                      {s.url_canonical && (
                        <a
                          href={s.url_canonical}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-verdigris/60 underline-offset-2 hover:underline"
                        >
                          source
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
