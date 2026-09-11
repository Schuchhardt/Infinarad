"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface SearchBarProps {
  locale: string;
  placeholder: string;
  suggestions: Array<{ slug: string; title: string }>;
  searchLabel?: string;
}

export function SearchBar({ locale, placeholder, suggestions, searchLabel = "Search" }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? suggestions.filter((s) =>
        s.title.toLowerCase().includes(query.toLowerCase()),
      )
    : suggestions;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
    setShowSuggestions(false);
  }

  function navigateToQuestion(slug: string) {
    setShowSuggestions(false);
    router.push(`/${locale}/question/${slug}`);
  }

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-[640px]">
      {/* text-base (16px) es el mínimo en móvil: por debajo, iOS hace zoom al enfocar el input */}
      <form onSubmit={handleSubmit} role="search">
        <div className="flex h-[52px] items-center gap-[10px] border border-border bg-surface ps-4 pe-1.5 sm:h-14 sm:gap-[14px] sm:ps-5 sm:pe-2">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" className="shrink-0 text-dim">
            <circle cx="7" cy="7" r="4.4"/>
            <path d="M10.3 10.3 14 14"/>
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full min-w-0 flex-1 border-none bg-transparent font-display text-base text-text outline-none sm:text-[19px]"
            aria-label={placeholder}
            autoComplete="off"
          />
          <button
            type="submit"
            aria-label={searchLabel}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center gap-2 bg-gold text-[11px] font-semibold uppercase tracking-[0.14em] text-background transition-colors hover:bg-gold-hover sm:w-auto sm:px-[22px]"
          >
            <span className="hidden sm:inline">{searchLabel}</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </button>
        </div>
      </form>

      {showSuggestions && filtered.length > 0 && (
        <ul
          className="absolute z-40 mt-1 max-h-[46vh] w-full overflow-y-auto overscroll-contain border border-border bg-surface shadow-xl shadow-black/40"
          role="listbox"
        >
          {filtered.slice(0, 6).map((s) => (
            <li key={s.slug} role="option" aria-selected={false}>
              <button
                onClick={() => navigateToQuestion(s.slug)}
                className="min-h-[48px] w-full px-4 py-3 text-start font-display text-[15px] leading-snug text-text/70 transition-colors hover:bg-background hover:text-text sm:px-5 sm:text-base"
              >
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
