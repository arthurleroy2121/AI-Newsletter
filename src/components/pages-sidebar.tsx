"use client";

import { Plus, FileText, X } from "lucide-react";
import type { NewsPage } from "@/lib/types";

interface PagesSidebarProps {
  pages: NewsPage[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onCreatePage: () => void;
  onDeletePage: (id: string) => void;
}

export default function PagesSidebar({
  pages,
  activePageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
}: PagesSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[220px] bg-[#1A1A2E] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-base font-bold text-white tracking-tight">
          News IA
        </h2>
        <p className="text-[10px] text-white/40 mt-0.5">Pages d&apos;actualités</p>
      </div>

      {/* New page button */}
      <div className="px-3 pb-3">
        <button
          onClick={onCreatePage}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-white/10 rounded-full hover:bg-white/15 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle page</span>
        </button>
      </div>

      {/* Separator */}
      <div className="mx-4 border-t border-white/10" />

      {/* Page list */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {pages.map((page) => {
          const isActive = page.id === activePageId;
          return (
            <div
              key={page.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/80"
              }`}
              onClick={() => onSelectPage(page.id)}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="text-sm truncate flex-1">{page.name}</span>
              {pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(page.id);
                  }}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
