import type { ReactNode } from "react";

interface SectionHeadingProps {
  id: string;
  title: string;
  count?: number;
  icon?: ReactNode;
}

export function SectionHeading({ id, title, count, icon }: SectionHeadingProps) {
  return (
    <div className="mb-[26px] flex items-center gap-3">
      {icon}
      <h2
        id={id}
        className="m-0 font-display text-[30px] font-medium"
      >
        {title}
      </h2>
      {count !== undefined && count > 0 && (
        <span className="text-[11px] text-dim tabular-nums">
          {String(count).padStart(2, "0")}
        </span>
      )}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
