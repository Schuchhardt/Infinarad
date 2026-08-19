import Image from "next/image";

interface FooterProps {
  locale: string;
}

const TAGLINES: Record<string, string> = {
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

export function Footer({ locale }: FooterProps) {
  const tagline = TAGLINES[locale] ?? TAGLINES["en"]!;

  return (
    <footer className="flex flex-wrap items-center gap-3 border-t border-border px-5 py-7 sm:gap-5 sm:px-8 sm:py-[30px] lg:px-[120px]">
      <Image
        src="/logo/infinarad-logo_transparent.png"
        alt="Infinarad"
        width={488}
        height={444}
        sizes="56px"
        className="h-11 w-auto object-contain opacity-50 sm:h-14"
      />
      <span className="font-display text-[13px] italic leading-snug text-dim sm:text-[15px]">
        {tagline}
      </span>
    </footer>
  );
}
