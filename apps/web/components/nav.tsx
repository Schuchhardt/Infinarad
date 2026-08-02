"use client";

import { usePathname, useRouter } from "next/navigation";

interface NavProps {
  locale: string;
  locales: Array<{ code: string; name: string }>;
}

export function Nav({ locale, locales }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <nav
      className="fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(13, 18, 32, 0.85)" }}
      role="navigation"
      aria-label="Main"
    >
      <span className="font-mono text-xs font-medium tracking-[0.2em] uppercase text-parchment/80">
        Infinarad
      </span>

      <div
        className="flex items-center gap-1 font-mono text-xs"
        role="group"
        aria-label="Language selector"
      >
        {locales.map((l, i) => (
          <span key={l.code} className="flex items-center">
            {i > 0 && (
              <span className="mx-1 text-muted/40" aria-hidden="true">
                ·
              </span>
            )}
            <button
              onClick={() => switchLocale(l.code)}
              className={`uppercase tracking-wider transition-colors ${
                l.code === locale
                  ? "text-gold"
                  : "text-muted hover:text-parchment"
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
