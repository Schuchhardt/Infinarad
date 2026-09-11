"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface NavProps {
  locale: string;
  locales: Array<{ code: string; name: string; direction?: string }>;
}

const NAV_LABELS: Record<string, { menu: string; close: string; home: string; questions: string; graph: string; search: string; chooseLang: string; localeNote: string }> = {
  en: { menu: "Menu", close: "Close", home: "Home", questions: "Questions", graph: "Graph", search: "Search", chooseLang: "Choose language", localeNote: "10 active locales. Untranslated content falls back to English with an EN badge." },
  es: { menu: "Menú", close: "Cerrar", home: "Inicio", questions: "Preguntas", graph: "Grafo", search: "Buscar", chooseLang: "Elegir idioma", localeNote: "10 idiomas activos. Los contenidos sin traducir se muestran en inglés con la etiqueta EN." },
  pt: { menu: "Menu", close: "Fechar", home: "Início", questions: "Perguntas", graph: "Grafo", search: "Buscar", chooseLang: "Escolher idioma", localeNote: "10 idiomas ativos. Conteúdos sem tradução são exibidos em inglês com a etiqueta EN." },
  fr: { menu: "Menu", close: "Fermer", home: "Accueil", questions: "Questions", graph: "Graphe", search: "Chercher", chooseLang: "Choisir la langue", localeNote: "10 langues actives. Le contenu non traduit est affiché en anglais avec le badge EN." },
  de: { menu: "Menü", close: "Schließen", home: "Start", questions: "Fragen", graph: "Graph", search: "Suchen", chooseLang: "Sprache wählen", localeNote: "10 aktive Sprachen. Nicht übersetzte Inhalte werden auf Englisch mit dem EN-Badge angezeigt." },
  ar: { menu: "القائمة", close: "إغلاق", home: "الرئيسية", questions: "الأسئلة", graph: "الرسم البياني", search: "بحث", chooseLang: "اختر اللغة", localeNote: "10 لغات نشطة. المحتوى غير المترجم يُعرض بالإنجليزية مع علامة EN." },
  hi: { menu: "मेन्यू", close: "बंद करें", home: "होम", questions: "प्रश्न", graph: "ग्राफ", search: "खोज", chooseLang: "भाषा चुनें", localeNote: "10 सक्रिय भाषाएँ। अनुवादित सामग्री अंग्रेजी में EN बैज के साथ दिखाई जाती है।" },
  zh: { menu: "菜单", close: "关闭", home: "首页", questions: "问题", graph: "图谱", search: "搜索", chooseLang: "选择语言", localeNote: "10 种活跃语言。未翻译内容以英文显示并带有 EN 标记。" },
  ja: { menu: "メニュー", close: "閉じる", home: "ホーム", questions: "問い", graph: "グラフ", search: "検索", chooseLang: "言語を選択", localeNote: "10の有効な言語。翻訳されていないコンテンツはENバッジ付きで英語で表示されます。" },
  he: { menu: "תפריט", close: "סגור", home: "בית", questions: "שאלות", graph: "גרף", search: "חיפוש", chooseLang: "בחר שפה", localeNote: "10 שפות פעילות. תוכן שלא תורגם מוצג באנגלית עם תג EN." },
};

export function Nav({ locale, locales }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [localeOpen, setLocaleOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const l = NAV_LABELS[locale] ?? NAV_LABELS["en"]!;

  const current = locales.find((loc) => loc.code === locale);
  const overlayOpen = localeOpen || menuOpen;

  // Con un overlay abierto el documento no debe seguir haciendo scroll detrás
  useEffect(() => {
    if (!overlayOpen) return;
    document.documentElement.classList.add("scroll-locked");
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLocaleOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.classList.remove("scroll-locked");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [overlayOpen]);

  function navigate(href: string) {
    setMenuOpen(false);
    router.push(href);
  }

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
    setLocaleOpen(false);
    setMenuOpen(false);
  }

  function isActive(path: string) {
    const stripped = pathname.replace(`/${locale}`, "") || "/";
    return stripped === path || stripped.startsWith(path + "/");
  }

  const navItems = [
    { href: `/${locale}`, path: "/", label: l.home, icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M2.5 6.8 8 2.4l5.5 4.4V13.5H2.5z"/><path d="M6.4 13.5V9.4h3.2v4.1"/></svg> },
    { href: `/${locale}/search`, path: "/search", label: l.questions, icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="8" cy="8" r="6"/><path d="M6.2 6.2a1.8 1.8 0 1 1 2.4 1.7c-.4.2-.6.5-.6.9v.4"/><circle cx="8" cy="11.6" r=".55" fill="currentColor" stroke="none"/></svg> },
    { href: `/${locale}/graph`, path: "/graph", label: l.graph, icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="4" cy="4" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="6" cy="12" r="2"/><path d="M5.6 5.2l5 .2M5 10.6l-0.4-5.2M7.4 11l3.4-3.8"/></svg> },
    { href: `/${locale}/search`, path: "/search-nav", label: l.search, icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="7" cy="7" r="4.4"/><path d="M10.3 10.3 14 14"/></svg> },
  ];

  const globeIcon = (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" className="text-gold">
      <circle cx="8" cy="8" r="6"/>
      <ellipse cx="8" cy="8" rx="2.6" ry="6"/>
      <path d="M2.3 6h11.4M2.3 10h11.4"/>
    </svg>
  );

  return (
    <>
      <nav
        className="glass-nav fixed top-0 z-50 flex w-full items-center gap-3 px-4 h-16 sm:gap-7 sm:px-8"
        role="navigation"
        aria-label="Main"
      >
        <button
          onClick={() => navigate(`/${locale}`)}
          className="flex shrink-0 items-center cursor-pointer"
          aria-label="Infinarad"
        >
          {/* El emblema es casi cuadrado (488x444): se dimensiona por alto
              para que no desborde la barra de 64px */}
          <Image
            src="/logo/infinarad-logo_transparent.png"
            alt="Infinarad"
            width={488}
            height={444}
            priority
            sizes="52px"
            className="h-10 w-auto object-contain sm:h-11"
          />
        </button>

        {/* Enlaces completos: sólo desde tablet en adelante */}
        <div className="hidden items-center gap-[22px] ms-2 md:flex">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.href)}
              className={`flex items-center gap-[7px] text-xs font-medium cursor-pointer transition-colors ${
                isActive(item.path) ? "text-text" : "text-muted/70 hover:text-text"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setLocaleOpen(true)}
          className="ms-auto flex h-11 items-center gap-2 px-3 border border-border bg-surface text-[11.5px] font-medium tracking-[0.06em] cursor-pointer hover:border-gold/40 transition-colors sm:h-[34px] sm:px-[13px]"
          aria-haspopup="dialog"
          aria-expanded={localeOpen}
          aria-label={l.chooseLang}
        >
          {globeIcon}
          <span className="uppercase">{locale}</span>
          <span className="hidden text-dim lg:inline">{current?.name}</span>
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-dim">
            <path d="M2.5 4.5 6 8l3.5-3.5"/>
          </svg>
        </button>

        {/* Botón hamburguesa: sólo móvil */}
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-surface cursor-pointer transition-colors hover:border-gold/40 md:hidden"
          aria-label={menuOpen ? l.close : l.menu}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? (
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-text">
              <path d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-text">
              <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"/>
            </svg>
          )}
        </button>
      </nav>

      {/* Panel de navegación móvil */}
      {menuOpen && (
        <div
          className="fixed inset-0 top-16 z-40 md:hidden animate-fade-in"
          style={{ background: "rgba(6,7,10,0.72)" }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            id="mobile-menu"
            className="border-b border-border bg-background shadow-2xl shadow-black/40 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.href)}
                className={`flex w-full items-center gap-3 border-b border-border/60 px-5 py-4 text-start text-sm font-medium cursor-pointer transition-colors ${
                  isActive(item.path) ? "text-text bg-gold/[0.06]" : "text-muted hover:text-text"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {localeOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center animate-fade-in sm:items-center"
          style={{ background: "rgba(6,7,10,0.78)", backdropFilter: "blur(6px)" }}
          onClick={() => setLocaleOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={l.chooseLang}
        >
          <div
            className="flex max-h-[88vh] w-full flex-col border-t border-border bg-surface shadow-2xl animate-fade-up sm:max-h-[86vh] sm:w-[560px] sm:max-w-[92%] sm:border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-[30px] sm:py-5">
              <span className="shrink-0">{globeIcon}</span>
              <h3 className="m-0 font-display text-[20px] font-medium sm:text-[26px]">{l.chooseLang}</h3>
              <button
                onClick={() => setLocaleOpen(false)}
                className="ms-auto flex h-10 w-10 shrink-0 items-center justify-center border border-border cursor-pointer hover:border-gold/40 transition-colors sm:h-7 sm:w-7"
                aria-label={l.close}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-muted">
                  <path d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5"/>
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2 overscroll-contain sm:max-h-[420px] sm:py-3">
              {locales.map((loc) => {
                const active = loc.code === locale;
                return (
                  <button
                    key={loc.code}
                    onClick={() => switchLocale(loc.code)}
                    className={`flex w-full items-center gap-3 px-5 py-3 min-h-[52px] cursor-pointer text-start transition-colors sm:gap-4 sm:px-[30px] sm:py-[13px] ${
                      active ? "bg-gold/[0.07]" : "hover:bg-card"
                    }`}
                    dir={loc.direction === "rtl" ? "rtl" : "ltr"}
                  >
                    <span className={`w-[26px] shrink-0 text-[10.5px] font-semibold tracking-[0.1em] uppercase ${
                      active ? "text-gold" : "text-dim"
                    }`}>
                      {loc.code}
                    </span>
                    <span className={`font-display text-lg sm:text-xl ${active ? "text-text" : "text-muted"}`}>
                      {loc.name}
                    </span>
                    <span className="hidden text-[9.5px] tracking-[0.1em] uppercase text-faint sm:inline">
                      {loc.direction === "rtl" ? "rtl" : "ltr"}
                    </span>
                    {active && (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="ms-auto shrink-0 text-gold">
                        <path d="M3 8.4 6.4 12l6.6-8"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-border px-5 py-4 text-[11.5px] leading-relaxed text-dim sm:px-[30px]">
              {l.localeNote}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
