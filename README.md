# Infinarad

**The Living Atlas of Humanity's Biggest Questions**

A multilingual, museum-quality knowledge platform that organizes humanity's greatest philosophical, historical, and cross-cultural questions — browsable by traditions, concepts, sources, and authors. The UI is inspired by illuminated manuscripts, with a dark aesthetic using lapis lazuli and gold as its visual metaphors.

Supports 10 languages: English, Spanish, Portuguese, French, German, Arabic, Hindi, Chinese, Japanese, Hebrew.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript 5.8 |
| Database | PostgreSQL 15 via Supabase |
| ORM | Drizzle ORM |
| Auth | Supabase Auth with RLS |
| i18n | next-intl v4 |
| Deployment | Netlify |

## Structure

```
apps/
  web/          # Next.js frontend (@infinarad/web)
packages/
  db/           # Database layer — Drizzle ORM, migrations, queries (@infinarad/db)
  i18n/         # Shared internationalisation utilities (@infinarad/i18n)
```

## Getting Started

Requires Node 22 and pnpm.

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`. Supabase runs locally on port 54322.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build all packages
pnpm test         # Run unit tests
pnpm test:e2e     # Run end-to-end tests
pnpm lint         # Lint all packages
pnpm clean        # Clean build artifacts

pnpm db:migrate   # Run database migrations
pnpm db:seed      # Seed the database
pnpm db:reset     # Drop only Infinarad objects (infi_*) — NEVER the whole schema
pnpm db:studio    # Open Drizzle Studio at port 54323
```

## Key Conventions

- All tables carry the `infi_` prefix (e.g. `infi_translation`, `infi_question`).
- The database schema is **shared with other projects**. All schema-level objects
  (tables, enums, functions, indexes, policies) are prefixed with `infi_`.
  Never run `DROP SCHEMA` or grant on `ALL TABLES` — scope everything to `infi_*`.
- All user-visible text lives in `infi_translation` tables. No `name` or `title` columns on content tables.
- Published content is never overwritten — a new `infi_revision` is always created.
- Always read translations from the `infi_translated` view, never directly from `infi_translation`.
- Migrations are append-only. Merged migrations are never edited.
- RLS is active on all tables. Every new table must include its Supabase policy.
- Color and typography tokens are defined exclusively in `app/globals.css`. No loose hex values in components.
- Server Components are the default. `'use client'` requires justification in the PR.

## Deployment

Deployed to [infinarad.com](https://infinarad.com) via Netlify.
