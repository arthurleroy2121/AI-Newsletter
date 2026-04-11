import { NextResponse } from "next/server";
import { fetchAINews } from "@/lib/openrouter";
import { generatePDF } from "@/lib/pdf-generator";

export async function POST(): Promise<Response> {
  try {
    // Step 1: Fetch AI news from OpenRouter (perplexity/sonar-pro)
    const news = await fetchAINews();

    // Step 2: Generate PDF
    const pdfBuffer = generatePDF(news);

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
