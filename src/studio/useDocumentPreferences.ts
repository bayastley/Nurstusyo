import { useEffect, type MutableRefObject } from "react";
import { LANGS, type Lang } from "../i18n";
import type { Theme } from "../data";

export function useDocumentTheme(theme: Theme, themeRef: MutableRefObject<Theme>) {
  useEffect(() => {
    themeRef.current = theme;
    const style = document.documentElement.style;
    style.setProperty("--accent", theme.acc);
    style.setProperty("--accent-2", theme.acc2);
    style.setProperty("--page", theme.bg);
    style.setProperty("--page-2", theme.bg2);
    style.setProperty("--text", theme.txt);
    localStorage.setItem("nur_theme", theme.id);
  }, [theme, themeRef]);
}

export function useDocumentLanguage(lang: Lang) {
  useEffect(() => {
    localStorage.setItem("nur_lang", lang);
    const current = LANGS.find((item) => item.code === lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = current?.dir ?? "ltr";
  }, [lang]);
}