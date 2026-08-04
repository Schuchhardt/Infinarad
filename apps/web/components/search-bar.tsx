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
    <div ref={containerRef} className="relative mx-auto w-full max-w-3xl">
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
            className="w-full rounded-[20px] border border-border bg-surface px-7 py-5 pe-14 font-display text-lg text-text placeholder:text-muted/40 transition-all duration-500 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/20"
            aria-label={placeholder}
            autoComplete="off"
          />
          <button
            type="submit"
            className="absolute end-5 top-1/2 -translate-y-1/2 text-muted/40 transition-colors duration-300 hover:text-gold"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
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
          className="absolute z-40 mt-3 w-full rounded-[16px] border border-border bg-card shadow-xl shadow-black/40"
          role="listbox"
        >
          {filtered.slice(0, 6).map((s) => (
            <li key={s.slug} role="option" aria-selected={false}>
              <button
                onClick={() => navigateToQuestion(s.slug)}
                className="w-full px-7 py-4 text-start font-display text-base text-text/70 transition-colors duration-200 first:rounded-t-[16px] last:rounded-b-[16px] hover:bg-surface hover:text-text"
              >
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isFocused && !query.trim() && !showSuggestions && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {suggestions.slice(0, 4).map((s) => (
            <button
              key={s.slug}
              onClick={() => navigateToQuestion(s.slug)}
              className="rounded-[16px] border border-border px-4 py-2 text-xs text-muted/60 transition-all duration-300 hover:border-gold/30 hover:text-text"
            >
              {s.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
