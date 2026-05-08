import type { TopicConfig } from "./chat-types";

export interface NewsItem {
  title: string;
  description: string;
  source: string;
  url: string;
}

export interface GenerateResponse {
  news: NewsItem[];
}

export interface GenerateError {
  error: string;
}

export interface AppSettings {
  newsCount: number;
  dateRange: string;
}

export interface NewsPage {
  id: string;
  name: string;
  topicConfig: TopicConfig | null;
  settings: AppSettings;
  newsItems: NewsItem[] | null;
  pdfBase64: string | null;
  status: "idle" | "loading" | "success" | "error";
  errorMessage: string | null;
  createdAt: number;
}

export type { TopicConfig } from "./chat-types";
