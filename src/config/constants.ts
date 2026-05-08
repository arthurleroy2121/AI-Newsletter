export const APP_NAME = "News IA";
export const APP_DESCRIPTION = "Résumé quotidien de l'intelligence artificielle";

export const PDF_COLORS = {
  primary: { r: 26, g: 26, b: 46 },       // #1A1A2E
  secondary: { r: 74, g: 74, b: 106 },     // #4A4A6A
  accent: { r: 26, g: 26, b: 46 },         // #1A1A2E
  lightAccent: { r: 230, g: 230, b: 235 }, // #E6E6EB
  white: { r: 255, g: 255, b: 255 },       // #FFFFFF
} as const;

export const STORAGE_KEY_TOPIC = "newsia-topic";
export const STORAGE_KEY_SETTINGS = "newsia-settings";
export const STORAGE_KEY_PAGES = "newsia-pages";
export const STORAGE_KEY_ACTIVE_PAGE = "newsia-active-page";
export const DEFAULT_NEWS_COUNT = 3;
export const DEFAULT_DATE_RANGE = "1j";
export const DATE_RANGE_OPTIONS = [
  { value: "1j", label: "1 jour", prompt: "dernières 24 heures" },
  { value: "2j", label: "2 jours", prompt: "dernières 48 heures" },
  { value: "3j", label: "3 jours", prompt: "3 derniers jours" },
  { value: "4j", label: "4 jours", prompt: "4 derniers jours" },
  { value: "5j", label: "5 jours", prompt: "5 derniers jours" },
  { value: "6j", label: "6 jours", prompt: "6 derniers jours" },
  { value: "1s", label: "1 semaine", prompt: "dernière semaine" },
] as const;
export const NEWS_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

/** Returns a human-readable label for the selected date range (e.g. "du jour", "des 5 derniers jours", "de la semaine"). */
export function getDateRangeLabel(dateRange: string): string {
  const option = DATE_RANGE_OPTIONS.find((o) => o.value === dateRange);
  if (!option) return "du jour";
  switch (dateRange) {
    case "1j": return "du jour";
    case "1s": return "de la semaine";
    default: return `des ${option.label.replace("jours", "derniers jours")}`;
  }
}

export const OPENROUTER_MODEL = "perplexity/sonar-pro";
export const OPENROUTER_CHAT_MODEL = "openai/gpt-4o-mini";
export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
