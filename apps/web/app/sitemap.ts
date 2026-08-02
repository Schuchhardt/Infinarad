import type { MetadataRoute } from "next";

const BASE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://infinarad.com";
const LOCALES = ["en", "es"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    const languages: Record<string, string> = {};
    for (const l of LOCALES) {
      languages[l] = `${BASE_URL}/${l}`;
    }
    languages["x-default"] = `${BASE_URL}/en`;

    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages },
    });
  }

  return entries;
}
