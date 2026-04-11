"use client";

import type { NewsItem } from "@/lib/types";
import NewsCard from "./news-card";

interface NewsPreviewProps {
  news: NewsItem[];
}

export default function NewsPreview({ news }: NewsPreviewProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-center text-sm font-medium text-[#4A4A6A] uppercase tracking-wider">
        Actualités du jour
      </h2>
      {news.map((item, index) => (
        <NewsCard key={index} news={item} index={index} />
      ))}
    </div>
  );
}
