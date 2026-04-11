"use client";

import { useMemo } from "react";
import { parseChatContent } from "@/lib/chat-parser";
import type { ChatMessage as ChatMessageType } from "@/lib/chat-types";
import ChatMCQ from "./chat-mcq";
import { Check } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
  onMCQSubmit: (selectedOptions: string[]) => void;
  isStreaming: boolean;
  isLastMessage: boolean;
}

export default function ChatMessage({
  message,
  onMCQSubmit,
  isStreaming,
  isLastMessage,
}: ChatMessageProps) {
  const parsed = useMemo(
    () =>
      message.role === "assistant"
        ? parseChatContent(message.content)
        : null,
    [message.role, message.content]
  );

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-br-md bg-[#6C63FF] text-white text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] space-y-1">
        {parsed?.textBefore && (
          <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-[#F4F3FF] text-[#1A1A2E] text-sm leading-relaxed whitespace-pre-wrap">
            {parsed.textBefore}
            {isStreaming && isLastMessage && !parsed.mcq && !parsed.topicReady && (
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-[#6C63FF] animate-pulse rounded-sm" />
            )}
          </div>
        )}

        {parsed?.mcq && (
          <ChatMCQ
            mcq={parsed.mcq}
            onSubmit={onMCQSubmit}
            disabled={isStreaming && isLastMessage}
          />
        )}

        {parsed?.topicReady && (
          <div className="flex items-center gap-2 px-3 py-2 mt-1 rounded-lg bg-green-50 border border-green-200">
            <Check className="w-4 h-4 text-green-600 shrink-0" />
            <span className="text-sm text-green-800">
              Sujet défini : <strong>{parsed.topicReady.topic}</strong>
            </span>
          </div>
        )}

        {parsed?.textAfter && (
          <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-[#F4F3FF] text-[#1A1A2E] text-sm leading-relaxed whitespace-pre-wrap">
            {parsed.textAfter}
          </div>
        )}

        {/* Show cursor when streaming and no content parsed yet */}
        {isStreaming && isLastMessage && !parsed?.textBefore && !parsed?.mcq && (
          <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-[#F4F3FF]">
            <span className="inline-block w-1.5 h-4 bg-[#6C63FF] animate-pulse rounded-sm" />
          </div>
        )}
      </div>
    </div>
  );
}
