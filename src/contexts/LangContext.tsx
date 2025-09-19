"use client";

import { translations } from "@/assets/data/translator";
import { createContext, useState, useMemo, Dispatch, SetStateAction } from "react";

type Language = "en" | "ar";

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};


interface LangContextType {
  lang: Language;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
  setLang: Dispatch<SetStateAction<Language>>;
}

export const LangContext = createContext<LangContextType>({
  lang: "en",
  dir: "ltr",
  t: (key) => key,
  setLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  const t = (key: string) => translations[lang][key] || key;

  const value = useMemo(
    () => ({
      lang,
      dir,
      t,
      setLang,
    }),
    [lang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
