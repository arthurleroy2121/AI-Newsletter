"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Newspaper, Calendar } from "lucide-react";
import type { AppSettings } from "@/lib/types";
import { DATE_RANGE_OPTIONS, NEWS_COUNT_OPTIONS } from "@/config/constants";

interface SettingsDropdownsProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

type OpenDropdown = "none" | "count" | "date";

export default function SettingsDropdowns({ settings, onSettingsChange }: SettingsDropdownsProps) {
  const [open, setOpen] = useState<OpenDropdown>("none");
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen("none"), []);

  // Close on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [close]);

  const toggleDropdown = (dropdown: "count" | "date") => {
    setOpen((prev) => (prev === dropdown ? "none" : dropdown));
  };

  const handleCountSelect = (count: number) => {
    onSettingsChange({ ...settings, newsCount: count });
    close();
  };

  const handleDateSelect = (value: string) => {
    onSettingsChange({ ...settings, dateRange: value });
    close();
  };

  const dateLabel = DATE_RANGE_OPTIONS.find((o) => o.value === settings.dateRange)?.label ?? "1 jour";

  return (
    <div ref={containerRef} className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {/* News count dropdown */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown("count")}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1A1A2E] rounded-full hover:bg-[#2A2A4E] transition-colors shadow-sm"
        >
          <Newspaper className="w-3 h-3" />
          {settings.newsCount} article{settings.newsCount > 1 ? "s" : ""}
          <ChevronDown className={`w-3 h-3 transition-transform ${open === "count" ? "rotate-180" : ""}`} />
        </button>

        {open === "count" && (
          <div className="absolute right-0 mt-2 w-36 bg-[#1A1A2E] rounded-xl shadow-lg border border-white/10 py-1 overflow-hidden">
            {NEWS_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => handleCountSelect(n)}
                className={`w-full text-left px-4 py-2 text-xs text-white transition-colors ${
                  settings.newsCount === n ? "bg-white/15 font-medium" : "hover:bg-white/10"
                }`}
              >
                {n} article{n > 1 ? "s" : ""}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date range dropdown */}
      <div className="relative">
        <button
          onClick={() => toggleDropdown("date")}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1A1A2E] rounded-full hover:bg-[#2A2A4E] transition-colors shadow-sm"
        >
          <Calendar className="w-3 h-3" />
          {dateLabel}
          <ChevronDown className={`w-3 h-3 transition-transform ${open === "date" ? "rotate-180" : ""}`} />
        </button>

        {open === "date" && (
          <div className="absolute right-0 mt-2 w-36 bg-[#1A1A2E] rounded-xl shadow-lg border border-white/10 py-1 overflow-hidden">
            {DATE_RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDateSelect(option.value)}
                className={`w-full text-left px-4 py-2 text-xs text-white transition-colors ${
                  settings.dateRange === option.value ? "bg-white/15 font-medium" : "hover:bg-white/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
