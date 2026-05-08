import { NextResponse } from "next/server";
import { fetchAINews } from "@/lib/openrouter";
import { generatePDF } from "@/lib/pdf-generator";
import { DEFAULT_NEWS_COUNT, DEFAULT_DATE_RANGE, DATE_RANGE_OPTIONS } from "@/config/constants";

interface GenerateRequestBody {
  topic?: string;
  keywords?: string[];
  newsCount?: number;
  dateRange?: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    // Read optional topic from request body
    let topic: string | undefined;
    let keywords: string[] | undefined;
    let newsCount: number = DEFAULT_NEWS_COUNT;
    let dateRange: string = DEFAULT_DATE_RANGE;

    try {
      const body = (await request.json()) as GenerateRequestBody;
      topic = body.topic;
      keywords = body.keywords;

      if (typeof body.newsCount === "number") {
        newsCount = Math.max(1, Math.min(10, Math.round(body.newsCount)));
      }
      if (typeof body.dateRange === "string") {
        dateRange = body.dateRange;
      }
    } catch {
      // No body or invalid JSON — use defaults
    }

    const dateOption = DATE_RANGE_OPTIONS.find((o) => o.value === dateRange) ?? DATE_RANGE_OPTIONS[0];

    // Step 1: Fetch news from OpenRouter (perplexity/sonar-pro)
    const news = await fetchAINews(topic, keywords, newsCount, dateOption.prompt);

    // Step 2: Generate PDF
    const pdfBuffer = generatePDF(news, topic, dateOption.prompt);

    // Step 3: Format date for filename
    const dateStr = new Date().toISOString().split("T")[0];

    // Step 4: Return PDF with news data in header
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="news-ia-${dateStr}.pdf"`,
        "X-News-Data": encodeURIComponent(JSON.stringify(news)),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Generate API error:", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
