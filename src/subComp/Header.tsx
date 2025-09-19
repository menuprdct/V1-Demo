"use client";
import { useContext } from "react";
import { LangContext } from "@/contexts/LangContext";

export default function Header() {
  const { lang, dir } = useContext(LangContext);
  // You can localize the restaurant name if needed
  const resName = lang === "ar" ? "مطعم المستقبل" : "Future Restaurant";
  return (
    <header
      className="w-full py-6 bg-primary text-primary-foreground text-center text-2xl font-bold tracking-wide shadow"
      dir={dir}
    >
      {resName}
    </header>
  );
}
