export const defaultLocale = "en" as const;

export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}

export interface TranslationResolution {
  value: string;
  locale: string;
  isFallback: boolean;
  isStale: boolean;
}

export function resolveField(
  translations: Array<{
    locale: string;
    field: string;
    value: string;
    is_fallback: boolean;
    is_stale: boolean;
  }>,
  field: string,
): TranslationResolution | null {
  const match = translations.find((t) => t.field === field);
  if (!match) return null;
  return {
    value: match.value,
    locale: match.locale,
    isFallback: match.is_fallback,
    isStale: match.is_stale,
  };
}
