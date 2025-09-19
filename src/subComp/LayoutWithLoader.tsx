"use client";
import { useState, useEffect } from "react";
import LoaderParticles from "./LoaderParticles";

export default function LayoutWithLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading or replace with actual logic
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoaderParticles color="#6366f1" />;

  return <>{children}</>;
}
