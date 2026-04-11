"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import type { ChatMessage as ChatMessageType, TopicConfig } from "@/lib/chat-types";
import { parseChatContent } from "@/lib/chat-parser";
import ChatMessage from "./chat-message";
import ChatInput from "./chat-input";

interface ChatPanelProps {
  onTopicReady: (topic: TopicConfig) => void;
}

export default function ChatPanel({ onTopicReady }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [topicConfig, setTopicConfig] = useState<TopicConfig | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessages = useCallback(
    async (allMessages: ChatMessageType[]) => {
      setIsStreaming(true);

      // Add empty assistant message for streaming
      setMessages([...allMessages, { role: "assistant", content: "" }]);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMessages }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg =
            (errorData as { error?: string }).error ||
            "Erreur de connexion. Réessayez.";
          setMessages([
            ...allMessages,
            { role: "assistant", content: errorMsg },
          ]);
          setIsStreaming(false);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          setMessages([
            ...allMessages,
            {
              role: "assistant",
              content: "Erreur : pas de réponse du serveur.",
            },
          ]);
          setIsStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;

          setMessages([
            ...allMessages,
            { role: "assistant", content: fullContent },
          ]);
        }

        // Check if the final message contains a TOPIC_READY block
        const parsed = parseChatContent(fullContent);
        if (parsed.topicReady) {
          setTopicConfig(parsed.topicReady);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setMessages([
            ...allMessages,
            {
              role: "assistant",
              content: "La connexion a ��té interrompue. Réessayez.",
            },
          ]);
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const handleSendMessage = useCallback(
    (text: string) => {
      const userMessage: ChatMessageType = { role: "user", content: text };
      const updatedMessages = [...messages, userMessage];

      // Filter out empty assistant messages from prior streaming
      const cleanMessages = updatedMessages.filter(
        (m) => m.role !== "assistant" || m.content.trim() !== ""
      );

      sendMessages(cleanMessages);
    },
    [messages, sendMessages]
  );

  const handleMCQSubmit = useCallback(
    (selectedOptions: string[]) => {
      const text = `J'ai choisi : ${selectedOptions.join(", ")}`;
      const userMessage: ChatMessageType = { role: "user", content: text };
      const updatedMessages = [...messages, userMessage];

      const cleanMessages = updatedMessages.filter(
        (m) => m.role !== "assistant" || m.content.trim() !== ""
      );

      sendMessages(cleanMessages);
    },
    [messages, sendMessages]
  );

  const handleUseTopic = useCallback(() => {
    if (topicConfig) {
      onTopicReady(topicConfig);
      setIsOpen(false);
    }
  }, [topicConfig, onTopicReady]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    // Send initial greeting if no messages yet
    if (messages.length === 0) {
      sendMessages([]);
    }
  }, [messages.length, sendMessages]);

  // Collapsed: floating button
  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl hover:border-[#6C63FF]/30 transition-all text-sm font-medium text-[#1A1A2E]"
      >
        <MessageSquare className="w-4 h-4 text-[#6C63FF]" />
        <span>Définir le sujet</span>
      </button>
    );
  }

  // Expanded: chat panel
  return (
    <div className="fixed top-4 left-4 z-50 w-[380px] max-h-[70vh] flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Purple accent strip */}
      <div className="h-1 bg-[#6C63FF]" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#6C63FF]" />
          <span className="text-sm font-semibold text-[#1A1A2E]">
            Assistant News
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-[#4A4A6A]" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px]">
        {messages
          .filter((m) => m.role !== "system")
          .map((message, index, filtered) => (
            <ChatMessage
              key={index}
              message={message}
              onMCQSubmit={handleMCQSubmit}
              isStreaming={isStreaming}
              isLastMessage={index === filtered.length - 1}
            />
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Topic confirmation */}
      {topicConfig && (
        <div className="px-4 py-3 border-t border-gray-100 bg-green-50">
          <button
            onClick={handleUseTopic}
            className="w-full py-2.5 text-sm font-medium rounded-lg bg-[#6C63FF] text-white hover:bg-[#5A52E0] transition-colors"
          >
            Utiliser ce sujet : {topicConfig.topic}
          </button>
        </div>
      )}

      {/* Input */}
      {!topicConfig && (
        <ChatInput onSend={handleSendMessage} disabled={isStreaming} />
      )}
    </div>
  );
}
