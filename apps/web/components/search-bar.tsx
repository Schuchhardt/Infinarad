"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface SearchBarProps {
  locale: string;
  placeholder: string;
  suggestions: Array<{ slug: string; title: string }>;
}

export function SearchBar({ locale, placeholder, suggestions }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  }

  function navigateToQuestion(slug: string) {
    setShowSuggestions(false);
    router.push(`/${locale}/question/${slug}`);
  }

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-2xl">
      <form onSubmit={handleSubmit} role="search">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              setShowSuggestions(true);
              setIsFocused(true);
            }}
            placeholder={placeholder}
            className="w-full rounded-sm border border-parchment/15 bg-ink-light/80 px-5 py-4 pe-12 font-display text-lg text-parchment placeholder:text-muted/50 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-colors"
            aria-label={placeholder}
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute end-4 top-1/2 -translate-y-1/2 text-muted/60 hover:text-gold transition-colors"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
      </form>

      {showSuggestions && filtered.length > 0 && (
        <ul
          className="absolute z-40 mt-2 w-full rounded-sm border border-parchment/10 bg-ink-light shadow-lg shadow-black/30"
          role="listbox"
        >
          {filtered.slice(0, 6).map((s) => (
            <li key={s.slug} role="option" aria-selected={false}>
              <button
                onClick={() => navigateToQuestion(s.slug)}
                className="w-full px-5 py-3 text-start font-display text-base text-parchment/80 hover:bg-lapis/20 hover:text-parchment transition-colors"
              >
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isFocused && !query.trim() && !showSuggestions && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {suggestions.slice(0, 4).map((s) => (
            <button
              key={s.slug}
              onClick={() => navigateToQuestion(s.slug)}
              className="rounded-sm border border-parchment/10 px-3 py-1.5 font-mono text-xs text-muted/70 transition-colors hover:border-gold/30 hover:text-parchment"
            >
              {s.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
