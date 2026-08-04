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
    en: "The Living Atlas of Humanity's Biggest Questions",
    es: "El Atlas Vivo de las Grandes Preguntas de la Humanidad",
    pt: "O Atlas Vivo das Maiores Questões da Humanidade",
    fr: "L'Atlas Vivant des Plus Grandes Questions de l'Humanité",
    de: "Der Lebendige Atlas der Größten Fragen der Menschheit",
    ar: "الأطلس الحي لأكبر أسئلة البشرية",
    hi: "मानवता के सबसे बड़े प्रश्नों का जीवित मानचित्र",
    zh: "人类最大问题的活地图集",
    ja: "人類の最大の問いの生きた地図帳",
    he: "האטלס החי של השאלות הגדולות של האנושות",
  };

  const subtitles: Record<string, string> = {
    en: "5,000 years of human thought. One place to explore it.",
    es: "5.000 años de pensamiento humano. Un lugar para explorarlo.",
    pt: "5.000 anos de pensamento humano. Um lugar para explorar.",
    fr: "5 000 ans de pensée humaine. Un lieu pour l'explorer.",
    de: "5.000 Jahre menschlichen Denkens. Ein Ort, um es zu erkunden.",
    ar: "٥٠٠٠ سنة من الفكر البشري. مكان واحد لاستكشافه.",
    hi: "5,000 वर्षों का मानव चिंतन। एक स्थान इसे अन्वेषित करने के लिए।",
    zh: "5000年人类思想。一个探索的地方。",
    ja: "5,000年の人類の思索。探究するための場所。",
    he: "5,000 שנות מחשבה אנושית. מקום אחד לחקור.",
  };

  const tagline = taglines[locale] ?? taglines["en"]!;
  const subtitle = subtitles[locale] ?? subtitles["en"]!;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#090B0F",
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
            color: "#C6A66B",
            textTransform: "uppercase" as const,
            marginBottom: 40,
          }}
        >
          INFINARAD
        </div>
        <div
          style={{
            fontSize: 44,
            color: "#F3F2EE",
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
            background: "#C6A66B",
            opacity: 0.3,
            margin: "32px 0",
          }}
        />
        <div
          style={{
            fontSize: 22,
            color: "#9AA5B3",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    { ...size },
  );
}
