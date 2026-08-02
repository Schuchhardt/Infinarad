import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es", "pt", "fr", "de", "ar", "hi", "zh", "ja", "he"],
  defaultLocale: "en",
});
