import { OPENROUTER_API_URL, OPENROUTER_MODEL } from "@/config/constants";
import { getSystemPrompt, getUserPrompt, SYSTEM_PROMPT, USER_PROMPT } from "./prompts";
import type { NewsItem, GenerateResponse } from "./types";

export async function fetchAINews(
  topic?: string,
  keywords?: string[],
  newsCount: number = 3,
  dateRangePrompt: string = "dernières 24 heures"
): Promise<NewsItem[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const systemPrompt = topic ? getSystemPrompt(topic, newsCount, dateRangePrompt) : SYSTEM_PROMPT;
  const userPrompt = topic ? getUserPrompt(topic, keywords ?? [], newsCount, dateRangePrompt) : USER_PROMPT;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://news-ia.vercel.app",
      "X-Title": "News IA",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: Math.max(4000, newsCount * 800),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("OpenRouter API error:", response.status, errorBody);
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from OpenRouter");
  }

  // Strip markdown code fences if present
  const jsonString = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  let parsed: GenerateResponse;
  try {
    parsed = JSON.parse(jsonString) as GenerateResponse;
  } catch {
    console.error("Failed to parse AI response:", jsonString.substring(0, 500));
    throw new Error("Invalid JSON response from AI model");
  }

  if (!parsed.news || !Array.isArray(parsed.news) || parsed.news.length === 0) {
    throw new Error(
      `Expected ${newsCount} news items, got ${parsed.news?.length ?? "none"}`
    );
  }

  return parsed.news.slice(0, newsCount);
}
