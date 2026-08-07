import type { MetadataRoute } from "next";
import { sql } from "@infinarad/db";
import { routing } from "@/i18n/routing";

const BASE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://infinarad.com";

async function getPublishedSlugs(): Promise<string[]> {
  try {
    const rows = await sql<{ slug: string }[]>`
      SELECT slug FROM infi_question WHERE status = 'published' ORDER BY sort_order
    `;
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = routing.locales;
  const slugs = await getPublishedSlugs();
  const entries: MetadataRoute.Sitemap = [];

  function alternates(path: string): { languages: Record<string, string> } {
    const languages: Record<string, string> = {};
    for (const l of locales) {
      languages[l] = `${BASE_URL}/${l}${path}`;
    }
    languages["x-default"] = `${BASE_URL}/en${path}`;
    return { languages };
  }

  for (const locale of locales) {
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: alternates(""),
    });

    entries.push({
      url: `${BASE_URL}/${locale}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: alternates("/search"),
    });

    for (const slug of slugs) {
      entries.push({
        url: `${BASE_URL}/${locale}/question/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: alternates(`/question/${slug}`),
      });
    }
  }

  return entries;
}
