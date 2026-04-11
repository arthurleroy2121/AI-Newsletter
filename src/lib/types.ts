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
