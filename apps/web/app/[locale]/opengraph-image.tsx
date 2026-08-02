import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Infinarad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const taglines: Record<string, string> = {
    en: "How humanity answers the great questions",
    es: "Cómo la humanidad responde las grandes preguntas",
    pt: "Como a humanidade responde às grandes questões",
    fr: "Comment l'humanité répond aux grandes questions",
    de: "Wie die Menschheit die großen Fragen beantwortet",
    ar: "كيف تجيب البشرية على الأسئلة الكبرى",
    hi: "मानवता महान प्रश्नों का उत्तर कैसे देती है",
    zh: "人类如何回答伟大的问题",
    ja: "人類はいかにして大いなる問いに答えてきたか",
    he: "כיצד האנושות עונה על השאלות הגדולות",
  };

  const subtitles: Record<string, string> = {
    en: "Documented. Cited. No conclusions.",
    es: "Documentado. Citado. Sin conclusiones.",
    pt: "Documentado. Citado. Sem conclusões.",
    fr: "Documenté. Cité. Sans conclusions.",
    de: "Dokumentiert. Zitiert. Ohne Schlussfolgerungen.",
    ar: "موثّق. مُستشهَد. بلا استنتاجات.",
    hi: "प्रलेखित। उद्धृत। कोई निष्कर्ष नहीं।",
    zh: "有据可查。引用翔实。不下结论。",
    ja: "文献に基づく。引用を明示。結論なし。",
    he: "מתועד. מצוטט. ללא מסקנות.",
  };

  const tagline = taglines[locale] ?? taglines["en"]!;
  const subtitle = subtitles[locale] ?? subtitles["en"]!;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0D1220",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.3em",
            color: "#C6A44D",
            textTransform: "uppercase" as const,
            marginBottom: 40,
            fontFamily: "monospace",
          }}
        >
          INFINARAD
        </div>
        <div
          style={{
            fontSize: 48,
            color: "#E9E4D8",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            width: 64,
            height: 1,
            background: "#C6A44D",
            opacity: 0.4,
            margin: "32px 0",
          }}
        />
        <div
          style={{
            fontSize: 24,
            color: "#8B90A3",
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    { ...size },
  );
}
