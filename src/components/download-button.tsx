"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useCallback } from "react";

interface DownloadButtonProps {
  pdfBlob: Blob;
}

export default function DownloadButton({ pdfBlob }: DownloadButtonProps) {
  const handleDownload = useCallback(() => {
    const dateStr = new Date().toISOString().split("T")[0];
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `news-ia-${dateStr}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [pdfBlob]);

  return (
    <div className="flex justify-center">
      <Button
        onClick={handleDownload}
        variant="outline"
        size="lg"
        className="border-[#1A1A2E] text-[#1A1A2E] hover:bg-[#1A1A2E]/5 px-8 py-6 text-base font-medium rounded-xl"
      >
        <Download className="mr-2 h-5 w-5" />
        Télécharger le PDF
      </Button>
    </div>
  );
}
