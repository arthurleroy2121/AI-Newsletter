"use client";

import { useState, useCallback } from "react";
import type { NewsItem } from "@/lib/types";
import HeroSection from "@/components/hero-section";
import GenerateButton from "@/components/generate-button";
import LoadingState from "@/components/loading-state";
import NewsPreview from "@/components/news-preview";
import DownloadButton from "@/components/download-button";
import ErrorState from "@/components/error-state";

type Status = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/generate", { method: "POST" });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la génération");
      }

      // Read news data from header
      const newsHeader = response.headers.get("X-News-Data");
      if (newsHeader) {
        const news = JSON.parse(decodeURIComponent(newsHeader)) as NewsItem[];
        setNewsItems(news);
      }

      // Read PDF blob
      const blob = await response.blob();
      setPdfBlob(blob);
      setStatus("success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Une erreur inattendue est survenue";
      setErrorMessage(message);
      setStatus("error");
    }
  }, []);

  return (
    <main className="flex-1 flex flex-col items-center justify-start py-12 sm:py-20 px-4 sm:px-6">
      <div className="w-full max-w-2xl space-y-10">
        <HeroSection />

        <GenerateButton
          onClick={handleGenerate}
          isLoading={status === "loading"}
        />

        {status === "loading" && <LoadingState />}

        {status === "error" && errorMessage && (
          <ErrorState message={errorMessage} onRetry={handleGenerate} />
        )}

        {status === "success" && newsItems && (
          <>
            <NewsPreview news={newsItems} />
            {pdfBlob && <DownloadButton pdfBlob={pdfBlob} />}
          </>
        )}
      </div>
    </main>
  );
}
