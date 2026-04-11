"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export default function GenerateButton({
  onClick,
  isLoading,
}: GenerateButtonProps) {
  return (
    <div className="flex justify-center">
      <Button
        onClick={onClick}
        disabled={isLoading}
        size="lg"
        className="bg-[#6C63FF] hover:bg-[#5A52E0] text-white px-8 py-6 text-base font-medium rounded-xl shadow-lg shadow-[#6C63FF]/20 transition-all hover:shadow-xl hover:shadow-[#6C63FF]/30"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Génération en cours...
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
