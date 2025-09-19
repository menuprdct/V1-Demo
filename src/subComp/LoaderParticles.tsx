"use client";
import { useContext } from "react";
import { LangContext } from "@/contexts/LangContext";
import { Particles } from "@/components/magicui/particles"; // Adjust path if needed

export default function LoaderParticles({ color = "#6366f1" }: { color?: string }) {
  const { t, dir } = useContext(LangContext);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background" dir={dir}>
      <Particles
        className="absolute inset-0 z-0"
        quantity={100}
        ease={80}
        color={color}
        refresh
      />
      <span className="relative z-10 mt-4 text-3xl font-bold">
        {t("loading")}
      </span>
    </div>
  );
}
