"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  return (
    <div className="p-3">
      <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Demandez-moi n'importe quoi..."
          rows={2}
          className="w-full resize-none rounded-2xl bg-transparent px-4 pt-3.5 pb-12 text-sm text-[#1A1A2E] placeholder:text-[#4A4A6A]/40 focus:outline-none disabled:opacity-50"
        />
        <div className="absolute bottom-2.5 right-2.5">
          <button
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1A1A2E] text-white hover:bg-[#2A2A4E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
