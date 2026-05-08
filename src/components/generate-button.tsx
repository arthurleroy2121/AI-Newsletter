"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  topic?: string;
}

export default function GenerateButton({
  onClick,
  isLoading,
  topic,
}: GenerateButtonProps) {
  return (
    <div className="flex justify-center">
      <Button
        onClick={onClick}
        disabled={isLoading}
        size="lg"
        className="bg-[#1A1A2E] hover:bg-[#2A2A4E] text-white px-8 py-6 text-base font-medium rounded-full shadow-lg shadow-[#1A1A2E]/20 transition-all hover:shadow-xl hover:shadow-[#1A1A2E]/30"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Génération {topic ? `« ${topic} »` : "en cours"}...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Générer le résumé des nouvelles
          </>
        )}
      </Button>
    </div>
  );
}
