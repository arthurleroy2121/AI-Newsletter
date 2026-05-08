"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NewsItem, AppSettings, NewsPage } from "@/lib/types";
import type { TopicConfig } from "@/lib/chat-types";
import { DEFAULT_NEWS_COUNT, DEFAULT_DATE_RANGE } from "@/config/constants";
import { loadPages, savePages, createNewPage, blobToBase64, base64ToBlob } from "@/lib/pages-storage";
import { AuroraBackground } from "@/components/ui/aurora-background";
import HeroSection from "@/components/hero-section";
import GenerateButton from "@/components/generate-button";
import LoadingState from "@/components/loading-state";
import NewsPreview from "@/components/news-preview";
import DownloadButton from "@/components/download-button";
import ErrorState from "@/components/error-state";
import ChatPanel from "@/components/chat/chat-panel";
import SettingsDropdowns from "@/components/settings-dropdowns";
import PagesSidebar from "@/components/pages-sidebar";

type Status = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [pages, setPages] = useState<NewsPage[]>([]);
  const [activePageId, setActivePageId] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  // Per-page live state (mirrors active page)
  const [status, setStatus] = useState<Status>("idle");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [newsItems, setNewsItems] = useState<NewsItem[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [topicConfig, setTopicConfig] = useState<TopicConfig | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    newsCount: DEFAULT_NEWS_COUNT,
    dateRange: DEFAULT_DATE_RANGE,
  });

  const [chatResetKey, setChatResetKey] = useState(0);
  const [chatOpenKey, setChatOpenKey] = useState(0);
  const [noTopicMessage, setNoTopicMessage] = useState(false);

  // Ref to track current pdfBase64 for the active page (avoid async state issues)
  const pdfBase64Ref = useRef<string | null>(null);

  // Load pages from localStorage on mount
  useEffect(() => {
    const { pages: loadedPages, activePageId: loadedActiveId } = loadPages();
    setPages(loadedPages);
    setActivePageId(loadedActiveId);

    // Load active page state
    const activePage = loadedPages.find((p) => p.id === loadedActiveId);
    if (activePage) {
      loadPageState(activePage);
    }

    setInitialized(true);
  }, []);

  function loadPageState(page: NewsPage) {
    setTopicConfig(page.topicConfig);
    setSettings(page.settings);
    setNewsItems(page.newsItems);
    setErrorMessage(page.errorMessage);
    setStatus(page.status === "loading" ? "idle" : page.status);
    setNoTopicMessage(false);

    if (page.pdfBase64) {
      pdfBase64Ref.current = page.pdfBase64;
      setPdfBlob(base64ToBlob(page.pdfBase64, "application/pdf"));
    } else {
      pdfBase64Ref.current = null;
      setPdfBlob(null);
    }
  }

  // Save current live state back into the pages array and persist
  const snapshotAndSave = useCallback(
    (
      currentPages: NewsPage[],
      currentActiveId: string,
      overrides?: Partial<NewsPage>
    ) => {
      const updated = currentPages.map((p) => {
        if (p.id !== currentActiveId) return p;
        return {
          ...p,
          topicConfig,
          settings,
          newsItems,
          errorMessage,
          status: status === "loading" ? ("idle" as const) : status,
          pdfBase64: pdfBase64Ref.current,
          name: topicConfig?.topic || "Sans thème",
          ...overrides,
        };
      });
      setPages(updated);
      savePages(updated, currentActiveId);
      return updated;
    },
    [topicConfig, settings, newsItems, errorMessage, status]
  );

  // Auto-save when relevant state changes (debounced via effect)
  useEffect(() => {
    if (!initialized || !activePageId) return;
    const updated = pages.map((p) => {
      if (p.id !== activePageId) return p;
      return {
        ...p,
        topicConfig,
        settings,
        newsItems,
        errorMessage,
        status: status === "loading" ? ("idle" as const) : status,
        pdfBase64: pdfBase64Ref.current,
        name: topicConfig?.topic || "Sans thème",
      };
    });
    savePages(updated, activePageId);
    // We intentionally don't call setPages here to avoid render loops.
    // The pages array in state may be slightly stale, but savePages persists the truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicConfig, settings, newsItems, errorMessage, status, initialized, activePageId]);

  const handleSelectPage = useCallback(
    (id: string) => {
      if (id === activePageId) return;

      // Snapshot current page into the array
      const updatedPages = snapshotAndSave(pages, activePageId);

      // Switch to new page
      setActivePageId(id);
      const targetPage = updatedPages.find((p) => p.id === id);
      if (targetPage) {
        loadPageState(targetPage);
      }

      // Reset chat for new page context
      setChatResetKey((k) => k + 1);

      // Persist
      savePages(updatedPages, id);
    },
    [activePageId, pages, snapshotAndSave]
  );

  const handleCreatePage = useCallback(() => {
    const newPage = createNewPage();

    // Snapshot current page first
    const updatedPages = snapshotAndSave(pages, activePageId);
    const newPages = [...updatedPages, newPage];

    setPages(newPages);
    setActivePageId(newPage.id);
    loadPageState(newPage);
    savePages(newPages, newPage.id);

    // Reset chat for the new page (don't auto-open)
    setChatResetKey((k) => k + 1);
  }, [pages, activePageId, snapshotAndSave]);

  const handleDeletePage = useCallback(
    (id: string) => {
      if (pages.length <= 1) return;

      const newPages = pages.filter((p) => p.id !== id);
      setPages(newPages);

      if (id === activePageId) {
        // Switch to first remaining page
        const nextPage = newPages[0];
        setActivePageId(nextPage.id);
        loadPageState(nextPage);
        setChatResetKey((k) => k + 1);
        savePages(newPages, nextPage.id);
      } else {
        savePages(newPages, activePageId);
      }
    },
    [pages, activePageId]
  );

  const handleTopicReady = useCallback((topic: TopicConfig) => {
    setTopicConfig(topic);
    setNoTopicMessage(false);
  }, []);

  const handleChangeTopic = useCallback(() => {
    setTopicConfig(null);
    setChatResetKey((k) => k + 1);
    setChatOpenKey((k) => k + 1);
  }, []);

  const handleDefineTopic = useCallback(() => {
    setChatOpenKey((k) => k + 1);
  }, []);

  const handleSettingsChange = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!topicConfig) {
      setNoTopicMessage(true);
      setChatOpenKey((k) => k + 1);
      return;
    }

    setNoTopicMessage(false);
    setStatus("loading");
    setErrorMessage(null);

    try {
      const fetchOptions: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicConfig?.topic,
          keywords: topicConfig?.keywords,
          newsCount: settings.newsCount,
          dateRange: settings.dateRange,
        }),
      };

      const response = await fetch("/api/generate", fetchOptions);

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

      // Store base64 for persistence
      const base64 = await blobToBase64(blob);
      pdfBase64Ref.current = base64;

      setStatus("success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Une erreur inattendue est survenue";
      setErrorMessage(message);
      setStatus("error");
    }
  }, [topicConfig, settings]);

  // Don't render until initialized to avoid hydration mismatch
  if (!initialized) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <PagesSidebar
        pages={pages}
        activePageId={activePageId}
        onSelectPage={handleSelectPage}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
      />

      <div className="flex-1 ml-[220px]">
        <AuroraBackground className="min-h-full flex-1 h-auto justify-start">
          <ChatPanel onTopicReady={handleTopicReady} resetKey={chatResetKey} openKey={chatOpenKey} />
          <SettingsDropdowns settings={settings} onSettingsChange={handleSettingsChange} />

          <AnimatePresence mode="wait">
          <motion.main
            key={activePageId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative z-10 flex-1 flex flex-col items-center justify-start py-12 sm:py-20 px-4 sm:px-6"
          >
            <div className="w-full max-w-2xl space-y-10">
              <HeroSection topic={topicConfig?.topic} dateRange={settings.dateRange} onChangeTopic={handleChangeTopic} onDefineTopic={handleDefineTopic} />

              <GenerateButton
                onClick={handleGenerate}
                isLoading={status === "loading"}
                topic={topicConfig?.topic}
              />

              {noTopicMessage && !topicConfig && (
                <div className="text-center p-4 bg-[#F5F5F7] border border-[#1A1A2E]/10 rounded-xl">
                  <p className="text-sm text-[#4A4A6A]">
                    Veuillez d&apos;abord{" "}
                    <button
                      onClick={handleDefineTopic}
                      className="text-[#1A1A2E] font-medium underline hover:text-[#2A2A4E] transition-colors"
                    >
                      définir le sujet
                    </button>
                    {" "}avant de générer les nouvelles.
                  </p>
                </div>
              )}

              {status === "loading" && <LoadingState topic={topicConfig?.topic} dateRange={settings.dateRange} />}

              {status === "error" && errorMessage && (
                <ErrorState message={errorMessage} onRetry={handleGenerate} />
              )}

              {status === "success" && newsItems && (
                <>
                  <NewsPreview news={newsItems} topic={topicConfig?.topic} dateRange={settings.dateRange} />
                  {pdfBlob && <DownloadButton pdfBlob={pdfBlob} />}
                </>
              )}
            </div>
          </motion.main>
          </AnimatePresence>
        </AuroraBackground>
      </div>
    </div>
  );
}
