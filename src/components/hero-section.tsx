"use client";

import { RefreshCw } from "lucide-react";

interface HeroSectionProps {
  topic?: string;
  onChangeTopic?: () => void;
}

export default function HeroSection({ topic, onChangeTopic }: HeroSectionProps) {
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="text-center space-y-4">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1A1A2E]">
        {topic || "Les nouvelles du jour"}
      </h1>
      <p className="text-sm text-[#4A4A6A]/70 capitalize">{today}</p>
      {topic && onChangeTopic && (
        <button
          onClick={onChangeTopic}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6C63FF] bg-[#F4F3FF] border border-[#6C63FF]/20 rounded-full hover:bg-[#6C63FF]/10 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Changer de thème
        </button>
      )}
    </div>
  );
}
