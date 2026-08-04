import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8 text-text">
      <h1 className="font-display text-4xl">{t("notFound")}</h1>
      <Link
        href="/"
        className="mt-6 text-sm font-medium text-gold underline-offset-4 hover:underline"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
