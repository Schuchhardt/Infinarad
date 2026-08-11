import type { RelatedWork } from "@/lib/questions";
import { SectionHeading } from "./section-heading";

interface WorksSectionProps {
  works: RelatedWork[];
  title: string;
}

function formatComposed(start: number | null, end: number | null): string {
  if (!start) return "";
  const fmt = (n: number) => n < 0 ? `-${Math.abs(n)}` : `${n}`;
  if (!end || end === start) return `≈ ${fmt(start)}`;
  return `≈ ${fmt(start)} / ${fmt(end)}`;
}

const ICON = (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="#C6A66B" strokeWidth="1.1">
    <path d="M2.4 3.2h4.2c.8 0 1.4.6 1.4 1.4v8.2c0-.8-.6-1.4-1.4-1.4H2.4z"/>
    <path d="M13.6 3.2H9.4c-.8 0-1.4.6-1.4 1.4v8.2c0-.8.6-1.4 1.4-1.4h4.2z"/>
  </svg>
);

export function WorksSection({ works, title }: WorksSectionProps) {
  if (works.length === 0) return null;

  return (
    <section id="s4" className="scroll-mt-[84px] mt-[68px]" aria-labelledby="works-heading">
      <SectionHeading id="works-heading" title={title} count={works.length} icon={ICON} />
      <div className="flex flex-col border border-border" style={{ gap: "1px", background: "#232D39" }}>
        {works.map((w) => (
          <div
            key={w.id}
            className="bg-background p-[18px_22px] flex gap-5 items-center transition-colors hover:bg-surface"
          >
            <span className="w-24 shrink-0 text-[10.5px] text-dim tabular-nums">
              {formatComposed(w.composed_start, w.composed_end)}
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
              <span className="font-display text-[19px] leading-[1.3]">{w.name}</span>
              {w.author_name && (
                <span className="text-[11.5px] text-muted">{w.author_name}</span>
              )}
            </div>
            {w.original_language && (
              <span className="text-[9.5px] font-medium tracking-[0.12em] uppercase text-accent border border-accent/35 px-2 py-[3px]">
                {w.original_language}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
