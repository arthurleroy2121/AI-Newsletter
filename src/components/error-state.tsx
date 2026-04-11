"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center space-y-4 py-8">
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[#1A1A2E] font-medium">
          Une erreur est survenue
        </p>
        <p className="text-sm text-[#4A4A6A]">{message}</p>
      </div>
      <Button
        onClick={onRetry}
        variant="outline"
        className="border-[#6C63FF] text-[#6C63FF] hover:bg-[#F4F3FF]"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Réessayer
      </Button>
    </div>
  );
}
