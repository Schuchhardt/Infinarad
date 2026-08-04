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

export function DocumentariesSection({
  documentaries,
  title,
}: DocumentariesSectionProps) {
  if (documentaries.length === 0) return null;

  return (
    <section className="px-6 py-16" aria-labelledby="docs-heading">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          id="docs-heading"
          title={title}
          count={documentaries.length}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          {documentaries.map((d) => (
            <div
              key={d.id}
              className="group overflow-hidden rounded-sm border border-border bg-surface/50 transition-colors hover:border-gold/30"
            >
              {d.youtube_id && (
                <div className="relative aspect-video bg-background">
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
              <div className="p-6">
                <h3
                  className="font-display text-lg text-text"
                  lang={d.is_fallback ? "en" : undefined}
                >
                  {d.name}
                </h3>
                <div className="mt-1 flex items-center gap-3">
                  {d.tradition_name && (
                    <span className="text-[0.65rem] font-medium uppercase tracking-wider text-accent/80">
                      {d.tradition_name}
                    </span>
                  )}
                  {d.duration_sec && (
                    <span className="text-[0.65rem] font-medium text-muted/50">
                      {formatDuration(d.duration_sec)}
                    </span>
                  )}
                </div>
                {d.summary && (
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {d.summary}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
