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
  return d ? `${b} — ${d}` : `b. ${b}`;
}

const ICON = (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="#C6A66B" strokeWidth="1.1">
    <circle cx="8" cy="5.4" r="2.8"/><path d="M2.8 13.6a5.2 5.2 0 0 1 10.4 0"/>
  </svg>
);

export function AuthorsSection({ authors, title }: AuthorsSectionProps) {
  if (authors.length === 0) return null;

  return (
    <section id="s3" className="scroll-mt-[84px] mt-[68px]" aria-labelledby="authors-heading">
      <SectionHeading id="authors-heading" title={title} count={authors.length} icon={ICON} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {authors.map((a) => (
          <div
            key={a.id}
            className="border border-border p-[20px_22px] flex gap-4 items-start"
          >
            <div className="w-12 h-[58px] shrink-0 bg-card flex items-end justify-center pb-1.5"
              style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(243,242,238,0.05) 0 6px, transparent 6px 12px)" }}
            >
              <span className="text-[7px] tracking-[0.08em] text-faint">RETRATO</span>
            </div>
            <div className="flex flex-col gap-[5px] min-w-0">
              <span className="font-display text-[19px]">{a.name}</span>
              {(a.birth_year || a.death_year) && (
                <span className="text-[10.5px] text-dim tabular-nums">
                  {formatLifespan(a.birth_year, a.death_year)}
                </span>
              )}
              {a.summary && (
                <span className="text-[13px] leading-[1.65] text-muted">{a.summary}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
