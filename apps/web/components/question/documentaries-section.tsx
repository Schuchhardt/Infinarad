import type { DocumentaryData } from "@/lib/questions";
import { SectionHeading } from "./section-heading";

interface DocumentariesSectionProps {
  documentaries: DocumentaryData[];
  title: string;
}

function formatDuration(sec: number | null): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const ICON = (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="#C6A66B" strokeWidth="1.1">
    <rect x="1.6" y="2.8" width="12.8" height="10.4" rx="1"/>
    <path d="M6.4 5.8l4 2.4-4 2.4z" fill="#C6A66B" stroke="none"/>
  </svg>
);

export function DocumentariesSection({
  documentaries,
  title,
}: DocumentariesSectionProps) {
  if (documentaries.length === 0) return null;

  return (
    <section id="s7" className="scroll-mt-[84px] mt-[68px]" aria-labelledby="docs-heading">
      <SectionHeading id="docs-heading" title={title} count={documentaries.length} icon={ICON} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documentaries.map((d) => (
          <div
            key={d.id}
            className="border border-border transition-colors hover:border-gold/35 overflow-hidden"
          >
            {d.youtube_id && (
              <div className="relative aspect-video bg-surface">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${d.youtube_id}`}
                  title={d.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                />
              </div>
            )}
            {!d.youtube_id && (
              <div className="aspect-video bg-surface flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="#C6A66B" stroke="none">
                    <path d="M5.6 3.2l7.2 4.8-7.2 4.8z"/>
                  </svg>
                </div>
              </div>
            )}
            <div className="p-[20px_22px] flex flex-col gap-[7px]">
              <span
                className="font-display text-[19px]"
                lang={d.is_fallback ? "en" : undefined}
              >
                {d.name}
              </span>
              <div className="flex items-center gap-3">
                {d.tradition_name && (
                  <span className="text-[9.5px] font-medium uppercase tracking-[0.14em] text-gold/60">
                    {d.tradition_name}
                  </span>
                )}
                {d.duration_sec && (
                  <span className="text-[10.5px] text-dim tabular-nums">
                    {formatDuration(d.duration_sec)}
                  </span>
                )}
              </div>
              {d.summary && (
                <span className="text-[13px] leading-[1.7] text-muted">{d.summary}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
