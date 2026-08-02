# Infinarad Platform

## Commands
pnpm dev · pnpm build · pnpm test · pnpm test:e2e
pnpm db:migrate · pnpm db:seed · pnpm db:reset · pnpm db:studio

## Reglas
- Todo texto visible al usuario vive en `translation`. Ninguna tabla de contenido
  lleva columna `name` o `title`.
- El contenido publicado no se sobreescribe: se crea una `revision` nueva.
- Leer traducciones siempre desde la vista `translated`, nunca de `translation`.
- Las migraciones no se editan una vez mergeadas. Se agrega una nueva.
- RLS activo en todas las tablas. Toda tabla nueva llega con su política.
- Tokens de color y tipografía solo desde `app/globals.css`. Sin valores hex sueltos
  en componentes.
- Server Components por defecto. `'use client'` requiere justificación en el PR.
