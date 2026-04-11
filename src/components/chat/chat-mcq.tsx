"use client";

import { useState, useCallback } from "react";
import type { MCQBlock } from "@/lib/chat-types";

interface ChatMCQProps {
  mcq: MCQBlock;
  onSubmit: (selectedOptions: string[]) => void;
  disabled: boolean;
}

export default function ChatMCQ({ mcq, onSubmit, disabled }: ChatMCQProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [otherText, setOtherText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleOption = useCallback(
    (index: number) => {
      if (submitted || disabled) return;
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    },
    [submitted, disabled]
  );

  const handleSubmit = useCallback(() => {
    if (submitted || disabled) return;
    const choices: string[] = [];
    for (const index of selected) {
      const option = mcq.options[index];
      if (option.isOther) {
        if (otherText.trim()) {
          choices.push(otherText.trim());
        }
      } else {
        choices.push(option.label);
      }
    }
    if (choices.length === 0) return;
    setSubmitted(true);
    onSubmit(choices);
  }, [submitted, disabled, selected, mcq.options, otherText, onSubmit]);

  const hasOtherSelected = Array.from(selected).some(
    (i) => mcq.options[i]?.isOther
  );
  const hasValidSelection =
    selected.size > 0 &&
    (!hasOtherSelected || otherText.trim().length > 0);

  return (
    <div className="mt-2 p-3 bg-[#F4F3FF] rounded-lg space-y-3">
      <p className="text-sm font-medium text-[#1A1A2E]">{mcq.question}</p>

      <div className="space-y-2">
        {mcq.options.map((option, index) => (
          <label
            key={index}
            className={`flex items-start gap-2.5 cursor-pointer ${
              submitted ? "opacity-70 cursor-default" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={selected.has(index)}
              onChange={() => toggleOption(index)}
              disabled={submitted || disabled}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#6C63FF] focus:ring-[#6C63FF] accent-[#6C63FF]"
            />
            {option.isOther ? (
              <div className="flex-1 flex items-center gap-2">
                <span className="text-sm text-[#1A1A2E]">Autre :</span>
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  disabled={submitted || disabled || !selected.has(index)}
                  placeholder="Votre réponse..."
                  className="flex-1 px-2 py-1 text-sm rounded border border-gray-200 bg-white text-[#1A1A2E] placeholder:text-[#4A4A6A]/40 focus:outline-none focus:ring-1 focus:ring-[#6C63FF]/30 disabled:opacity-50"
                />
              </div>
            ) : (
              <span className="text-sm text-[#1A1A2E]">{option.label}</span>
            )}
          </label>
        ))}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!hasValidSelection || disabled}
          className="w-full py-2 text-sm font-medium rounded-lg bg-[#6C63FF] text-white hover:bg-[#5A52E0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Confirmer
        </button>
      )}
    </div>
  );
}
