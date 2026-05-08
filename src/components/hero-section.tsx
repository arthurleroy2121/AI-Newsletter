"use client";

import { RefreshCw, MessageSquare } from "lucide-react";
import { getDateRangeLabel } from "@/config/constants";

interface HeroSectionProps {
  topic?: string;
  dateRange: string;
  onChangeTopic?: () => void;
  onDefineTopic?: () => void;
}

export default function HeroSection({ topic, dateRange, onChangeTopic, onDefineTopic }: HeroSectionProps) {
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="text-center space-y-4">
      <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-[#1A1A2E]">
        {topic || `Les nouvelles ${getDateRangeLabel(dateRange)}`}
      </h1>
      <p className="text-base text-[#4A4A6A]/60 font-light capitalize">{today}</p>
      {topic && onChangeTopic && (
        <button
          onClick={onChangeTopic}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1A1A2E] rounded-full hover:bg-[#2A2A4E] transition-colors shadow-sm"
        >
          <RefreshCw className="w-3 h-3" />
          Changer de thème
        </button>
      )}
      {!topic && onDefineTopic && (
        <button
          onClick={onDefineTopic}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1A1A2E] rounded-full hover:bg-[#2A2A4E] transition-colors shadow-sm"
        >
          <MessageSquare className="w-3 h-3" />
          Définir le sujet
        </button>
      )}
    </div>
  );
}
