import type { NewsPage, AppSettings } from "./types";
import type { TopicConfig } from "./chat-types";
import {
  STORAGE_KEY_PAGES,
  STORAGE_KEY_ACTIVE_PAGE,
  STORAGE_KEY_TOPIC,
  STORAGE_KEY_SETTINGS,
  DEFAULT_NEWS_COUNT,
  DEFAULT_DATE_RANGE,
} from "@/config/constants";

export function createNewPage(): NewsPage {
  return {
    id: crypto.randomUUID(),
    name: "Sans thème",
    topicConfig: null,
    settings: { newsCount: DEFAULT_NEWS_COUNT, dateRange: DEFAULT_DATE_RANGE },
    newsItems: null,
    pdfBase64: null,
    status: "idle",
    errorMessage: null,
    createdAt: Date.now(),
  };
}

export function loadPages(): { pages: NewsPage[]; activePageId: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAGES);
    const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_PAGE);

    if (raw) {
      const pages = JSON.parse(raw) as NewsPage[];
      if (pages.length > 0) {
        const validActiveId =
          activeId && pages.some((p) => p.id === activeId)
            ? activeId
            : pages[0].id;
        return { pages, activePageId: validActiveId };
      }
    }
  } catch {
    // Fall through to migration or default
  }

  // Migration from legacy keys
  return migrateLegacyData();
}

function migrateLegacyData(): { pages: NewsPage[]; activePageId: string } {
  const page = createNewPage();

  try {
    const savedTopic = localStorage.getItem(STORAGE_KEY_TOPIC);
    if (savedTopic) {
      const topic = JSON.parse(savedTopic) as TopicConfig;
      page.topicConfig = topic;
      page.name = topic.topic;
    }
  } catch {
    // Ignore
  }

  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings) as Partial<AppSettings>;
      if (typeof parsed.newsCount === "number" && parsed.newsCount >= 1 && parsed.newsCount <= 10) {
        page.settings.newsCount = parsed.newsCount;
      }
      if (typeof parsed.dateRange === "string") {
        page.settings.dateRange = parsed.dateRange;
      }
    }
  } catch {
    // Ignore
  }

  const pages = [page];
  const activePageId = page.id;

  // Save new format and clean up legacy keys
  savePages(pages, activePageId);
  try {
    localStorage.removeItem(STORAGE_KEY_TOPIC);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
  } catch {
    // Ignore
  }

  return { pages, activePageId };
}

export function savePages(pages: NewsPage[], activePageId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(pages));
    localStorage.setItem(STORAGE_KEY_ACTIVE_PAGE, activePageId);
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g. "data:application/pdf;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteChars = atob(base64);
  const byteNumbers = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  return new Blob([byteNumbers], { type: mimeType });
}
