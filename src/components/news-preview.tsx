"use client";

import type { NewsItem } from "@/lib/types";
import { getDateRangeLabel } from "@/config/constants";
import NewsCard from "./news-card";

interface NewsPreviewProps {
  news: NewsItem[];
  topic?: string;
  dateRange: string;
}

export default function NewsPreview({ news, topic, dateRange }: NewsPreviewProps) {
  const rangeLabel = getDateRangeLabel(dateRange);
  const subject = topic || "IA";

  return (
    <div className="space-y-4">
      <h2 className="text-center text-sm font-medium text-[#4A4A6A] uppercase tracking-wider">
        Actualités {subject} {rangeLabel}
      </h2>
      {news.map((item, index) => (
        <NewsCard key={index} news={item} index={index} />
      ))}
    </div>
  );
}
