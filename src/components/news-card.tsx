"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { NewsItem } from "@/lib/types";
import { ExternalLink } from "lucide-react";

interface NewsCardProps {
  news: NewsItem;
  index: number;
}

export default function NewsCard({ news, index }: NewsCardProps) {
  return (
    <Card className="border border-gray-100 hover:border-[#1A1A2E]/20 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1A1A2E]/10 flex items-center justify-center">
            <span className="text-lg font-bold text-[#1A1A2E]">
              {index + 1}
            </span>
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            <h3 className="font-semibold text-[#1A1A2E] text-lg leading-tight">
              {news.title}
            </h3>
            <p className="text-[#4A4A6A] text-sm leading-relaxed">
              {news.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#4A4A6A]/70 pt-1">
              <span className="font-medium">{news.source}</span>
              {news.url && (
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#1A1A2E] hover:underline"
                >
                  Lire <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
