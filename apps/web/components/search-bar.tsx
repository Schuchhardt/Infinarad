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
      <form onSubmit={handleSubmit} role="search">
        <div className="flex items-center gap-[14px] h-14 px-5 pe-2 border border-border bg-surface">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#5F6B79" strokeWidth="1.2" className="shrink-0">
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
            className="flex-1 bg-transparent border-none outline-none text-text font-display text-[19px]"
            aria-label={placeholder}
            autoComplete="off"
          />
          <button
            type="submit"
            className="h-10 px-[22px] bg-gold text-background font-semibold text-[11px] tracking-[0.14em] uppercase flex items-center gap-2 cursor-pointer hover:bg-gold-hover transition-colors"
          >
            {searchLabel}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#090B0F" strokeWidth="1.5">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </button>
        </div>
      </form>

      {showSuggestions && filtered.length > 0 && (
        <ul
          className="absolute z-40 mt-1 w-full border border-border bg-surface shadow-xl shadow-black/40"
          role="listbox"
        >
          {filtered.slice(0, 6).map((s) => (
            <li key={s.slug} role="option" aria-selected={false}>
              <button
                onClick={() => navigateToQuestion(s.slug)}
                className="w-full px-5 py-3 text-start font-display text-base text-text/70 transition-colors hover:bg-background hover:text-text"
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
