"use client";
import { useContext } from "react";
import { LangContext } from "@/contexts/LangContext";

export default function Footer() {
  const { lang, dir } = useContext(LangContext);
  // Company name can be localized if needed
  const company = lang === "ar" ? "شركة ريا الدولية" : "Raya International Services";
  return (
    <footer
      className="w-full py-4 bg-muted text-muted-foreground text-center text-sm mt-8"
      dir={dir}
    >
      &copy; {new Date().getFullYear()} {company}
    </footer>
  );
}
