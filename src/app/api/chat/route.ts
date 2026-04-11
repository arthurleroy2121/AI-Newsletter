import { NextResponse } from "next/server";
import { OPENROUTER_API_URL, OPENROUTER_CHAT_MODEL } from "@/config/constants";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat-prompts";
import type { ChatMessage } from "@/lib/chat-types";

interface ChatRequestBody {
  messages: ChatMessage[];
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!body.messages || !Array.isArray(body.messages)) {
    return NextResponse.json(
      { error: "messages array is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "https://news-ia.vercel.app",
        "X-Title": "News IA",
      },
      body: JSON.stringify({
        model: OPENROUTER_CHAT_MODEL,
        messages: [
          { role: "system", content: CHAT_SYSTEM_PROMPT },
          ...body.messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenRouter chat API error:", response.status, errorBody);

      let detail = `OpenRouter API error: ${response.status}`;
      try {
        const parsed = JSON.parse(errorBody) as {
          error?: { message?: string };
        };
        if (parsed.error?.message) {
          detail = parsed.error.message;
        }
      } catch {
        // Utiliser le message par défaut
      }

      return NextResponse.json({ error: detail }, { status: 502 });
    }

    // Stream the response to the client
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { error: "No response stream from OpenRouter" },
        { status: 502 }
      );
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Buffer pour accumuler les lignes SSE incomplètes entre les chunks
        let lineBuffer = "";

        function processSSELine(line: string) {
          if (!line.startsWith("data: ")) return;
          const data = line.substring(6).trim();
          if (data === "[DONE]") return;

          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{
                delta?: { content?: string };
              }>;
              content?: string;
            };
            // Handle both standard OpenAI format and OpenRouter simplified format
            const content =
              parsed.choices?.[0]?.delta?.content ?? parsed.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          } catch {
            // Skip genuinely malformed JSON
          }
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            lineBuffer += chunk;
            const lines = lineBuffer.split("\n");

            // Le dernier élément est potentiellement incomplet — le garder pour le prochain chunk
            lineBuffer = lines.pop() ?? "";

            for (const line of lines) {
              processSSELine(line);
            }
          }

          // Traiter le reste du buffer après la fin du stream
          if (lineBuffer.trim()) {
            processSSELine(lineBuffer.trim());
          }
        } catch (error) {
          console.error("Stream processing error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Chat API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
