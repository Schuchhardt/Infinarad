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

const ICON = (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="#C6A66B" strokeWidth="1.1">
    <path d="M2 4h12M2 8h12M2 12h8"/>
  </svg>
);

export function SourcesSection({ sources, title }: SourcesSectionProps) {
  if (sources.length === 0) return null;

  return (
    <section id="s8" className="scroll-mt-[84px] mt-[68px]" aria-labelledby="sources-heading">
      <SectionHeading id="sources-heading" title={title} count={sources.length} icon={ICON} />
      <div className="flex flex-col border border-border" style={{ gap: "1px", background: "#232D39" }}>
        {sources.map((s, i) => (
          <div
            key={`${s.id}-${i}`}
            className="bg-background p-[22px_24px] flex gap-5 items-start transition-colors hover:bg-surface"
          >
            <span className="shrink-0 text-[10.5px] text-dim tabular-nums mt-[5px] w-7 text-right">
              [{i + 1}]
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-[8px]">
              <span className="text-[13.5px] text-text/90 leading-[1.6]">
                {formatSourceRef(s)}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[9.5px] font-medium uppercase tracking-[0.14em] text-gold/60">
                  {s.kind.replace("_", " ")}
                </span>
                {s.locator && (
                  <span className="text-[10.5px] text-dim">{s.locator}</span>
                )}
              </div>
              {s.claim_text && (
                <span className="text-[13px] leading-[1.7] text-muted">{s.claim_text}</span>
              )}
              {s.quote && (
                <blockquote className="border-l-2 border-gold/30 pl-4 font-display text-[14px] italic text-text/60 leading-[1.7]">
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
              )}
              {(s.doi || s.url_canonical || s.isbn) && (
                <div className="flex flex-wrap gap-3 text-[9.5px] text-dim">
                  {s.doi && <span>DOI: {s.doi}</span>}
                  {s.isbn && <span>ISBN: {s.isbn}</span>}
                  {s.url_canonical && (
                    <a
                      href={s.url_canonical}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      source
                    </a>
                  )}
                </div>
              )}
              <div className="flex gap-[2px] h-[4px] mt-1">
                <div className="flex-1 rounded-[1px]" style={{ background: "#C6A66B", opacity: 0.7 }} />
                <div className="flex-1 rounded-[1px]" style={{ background: "#506C86", opacity: 0.35 }} />
                <div className="flex-1 rounded-[1px]" style={{ background: "#3E4A57", opacity: 0.18 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
