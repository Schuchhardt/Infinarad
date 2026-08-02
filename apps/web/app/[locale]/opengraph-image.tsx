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

  const tagline =
    locale === "es"
      ? "Cómo la humanidad responde las grandes preguntas"
      : "How humanity answers the great questions";

  const subtitle =
    locale === "es"
      ? "Documentado. Citado. Sin conclusiones."
      : "Documented. Cited. No conclusions.";

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
