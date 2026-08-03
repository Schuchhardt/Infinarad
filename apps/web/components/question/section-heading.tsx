interface SectionHeadingProps {
  id: string;
  title: string;
  count?: number;
}

export function SectionHeading({ id, title, count }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex items-baseline gap-3">
      <h2
        id={id}
        className="font-mono text-xs tracking-[0.3em] uppercase text-gold"
      >
        {title}
      </h2>
      {count !== undefined && count > 0 && (
        <span className="font-mono text-[0.65rem] text-muted/50">
          {count}
        </span>
      )}
    </div>
  );
}
