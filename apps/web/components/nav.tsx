"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NavProps {
  locale: string;
  locales: Array<{ code: string; name: string }>;
}

export function Nav({ locale, locales }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    function onScroll() {
      setAtTop(window.scrollY < 20);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <nav
      className={`glass-nav fixed top-0 z-50 flex w-full items-center justify-between px-8 py-4 ${atTop ? "at-top" : ""}`}
      role="navigation"
      aria-label="Main"
    >
      <span className="text-sm font-medium tracking-[0.2em] uppercase text-text/80">
        Infinarad
      </span>

      <div
        className="flex items-center gap-1.5 text-xs"
        role="group"
        aria-label="Language selector"
      >
        {locales.map((l, i) => (
          <span key={l.code} className="flex items-center">
            {i > 0 && (
              <span className="mx-1 text-muted/30" aria-hidden="true">
                ·
              </span>
            )}
            <button
              onClick={() => switchLocale(l.code)}
              className={`uppercase tracking-wider transition-colors duration-300 ${
                l.code === locale
                  ? "text-gold"
                  : "text-muted/60 hover:text-text"
              }`}
              aria-current={l.code === locale ? "page" : undefined}
              aria-label={l.name}
            >
              {l.code}
            </button>
          </span>
        ))}
      </div>
    </nav>
  );
}
