import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const BASE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://infinarad.com";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  const alternates: Record<string, string> = {};
  for (const loc of routing.locales) {
    alternates[loc] = `${BASE_URL}/${loc}`;
  }
  alternates["x-default"] = `${BASE_URL}/en`;

  return {
    title: {
      default: `${t("appName")} — ${t("tagline")}`,
      template: `%s | ${t("appName")}`,
    },
    description: t("description"),
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: alternates,
    },
    openGraph: {
      type: "website",
      locale,
      siteName: t("appName"),
      images: [
        {
          url: `${BASE_URL}/images/infinarad_opentag.png`,
          width: 1200,
          height: 630,
          alt: t("appName"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [`${BASE_URL}/images/infinarad_opentag.png`],
    },
  };
}

const RTL_LOCALES = new Set(["ar", "he"]);

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();
  const dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`antialiased ${cormorant.variable} ${inter.variable}`}>
      <head />
      <body className="min-h-screen bg-background text-text">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
