# Infinarad Platform

## Commands
pnpm dev · pnpm build · pnpm test · pnpm test:e2e
pnpm db:migrate · pnpm db:seed · pnpm db:reset · pnpm db:studio

## Reglas
- El schema `public` es **compartido con otros proyectos**. Todos los objetos a nivel
  schema (tablas, enums, funciones, índices, políticas, vistas) llevan el prefijo
  `infi_`. Nunca usar `DROP SCHEMA`, ni grants sobre `ALL TABLES`/`ALL SEQUENCES`,
  ni nombres de objetos genéricos: todo va acotado a `infi_*`.
- Todas las tablas llevan el prefijo `infi_` (ej: `infi_translation`, `infi_question`).
- Todo texto visible al usuario vive en `infi_translation`. Ninguna tabla de contenido
  lleva columna `name` o `title`.
- El contenido publicado no se sobreescribe: se crea una `infi_revision` nueva.
- Leer traducciones siempre desde la vista `infi_translated`, nunca de `infi_translation`.
- Las migraciones no se editan una vez mergeadas. Se agrega una nueva.
- RLS activo en todas las tablas. Toda tabla nueva llega con su política.
- Tokens de color y tipografía solo desde `app/globals.css`. Sin valores hex sueltos
  en componentes.
- Server Components por defecto. `'use client'` requiere justificación en el PR.
