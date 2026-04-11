export const APP_NAME = "News IA";
export const APP_DESCRIPTION = "Résumé quotidien de l'intelligence artificielle";

export const PDF_COLORS = {
  primary: { r: 26, g: 26, b: 46 },       // #1A1A2E
  secondary: { r: 74, g: 74, b: 106 },     // #4A4A6A
  accent: { r: 108, g: 99, b: 255 },       // #6C63FF
  lightAccent: { r: 244, g: 243, b: 255 }, // #F4F3FF
  white: { r: 255, g: 255, b: 255 },       // #FFFFFF
} as const;

export const OPENROUTER_MODEL = "perplexity/sonar-pro";
export const OPENROUTER_CHAT_MODEL = "openai/gpt-4o-mini";
export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
