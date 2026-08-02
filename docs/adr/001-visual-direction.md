# ADR 001: Visual Direction — Illuminated Manuscript

## Status
Accepted

## Context
The landing page needs a visual identity that communicates "museum digital: calmo, cinematográfico, atemporal, premium, académicamente confiable" without falling into common defaults:
- Cream background + high-contrast serif + terracotta accent
- Near-black + neon accent
- Newspaper layout with hairline rules

## Decision
The visual direction draws from the **illuminated manuscript** — a form that exists simultaneously in Persian, Byzantine, European, Ethiopian, and Mughal traditions. Its pigments are lapis lazuli and gold leaf.

### Color tokens
- `--ink: #0D1220` — deep observatory night, base background
- `--lapis: #1E2F63` — elevated surfaces
- `--gold: #C6A44D` — single accent, used like real gold leaf (sparingly, one place per screen)
- `--verdigris: #4E7C74` — secondary, copper patina
- `--parchment: #E9E4D8` — primary text on dark
- `--muted: #8B90A3` — metadata

### Typography
- **Display:** EB Garamond — humanist serif from the academic tradition. Used large and with restraint.
- **Body:** Noto Sans — chosen because Noto exists to render every writing system in the world. The subject matter itself dictates this choice. Loaded per locale via `locale.font_stack`.
- **Utility:** IBM Plex Mono — gives the register of critical apparatus (note numbers, provenance, dates).

### Hero element
The hero cycles a question through the world's writing systems (Devanagari, Arabic, Japanese, Greek, Hebrew, Latin) with slow transitions and real Noto typography, not images. It is the product thesis and the multilingual requirement demonstrated in the same object.

## Consequences
- Dark background requires careful contrast ratios (WCAG AA minimum)
- Gold accent must be used with extreme restraint to maintain its impact
- Font loading strategy must be locale-aware to avoid loading unnecessary script families
- The design is deliberately dark-mode-only for the public landing; future dashboard may need a light mode
