"use client";

import { useContext } from "react";
import { LangContext } from "@/contexts/LangContext";
import { Button } from "@/components/ui/button";
import { Globe, Languages } from "lucide-react";

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useContext(LangContext);

  return (
    <div className="flex gap-2 items-center">
      <Button
        variant={lang === "en" ? "default" : "outline"}
        onClick={() => setLang("en")}
        className="flex items-center gap-2"
      >
        <Globe className="w-4 h-4" />
        {t("english")}
      </Button>
      <Button
        variant={lang === "ar" ? "default" : "outline"}
        onClick={() => setLang("ar")}
        className="flex items-center gap-2"
      >
        <Languages className="w-4 h-4" />
        {t("arabic")}
      </Button>
    </div>
  );
}
