"use client";
import { useEffect, useState } from "react";

export type Lang = "es" | "en";

export function useLang(defaultLang: Lang = "es") {
  const [lang, setLang] = useState<Lang>(defaultLang);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("spai_lang") as Lang | null;
      if (saved === "es" || saved === "en") setLang(saved);
    } catch {}
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as Lang | undefined;
      if (detail === "es" || detail === "en") setLang(detail);
    };
    window.addEventListener("spai:lang", onChange);
    return () => window.removeEventListener("spai:lang", onChange);
  }, []);

  return lang;
}
