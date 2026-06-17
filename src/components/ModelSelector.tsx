"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { MODELS, PROVIDER_CONFIG, type AIModel, type Provider } from "@/lib/models";

interface ModelSelectorProps {
  selectedModelId: string;
  onSelect: (modelId: string) => void;
  hasApiKey: (provider: Provider) => boolean;
}

export default function ModelSelector({
  selectedModelId,
  onSelect,
  hasApiKey,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | Provider>("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedModel = MODELS.find((m) => m.id === selectedModelId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredModels = useMemo(() => {
    let result = MODELS;

    if (filter === "free") {
      result = result.filter((m) => m.isFree);
    } else if (filter !== "all") {
      result = result.filter((m) => m.provider === filter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.modelId.toLowerCase().includes(q)
      );
    }

    return result;
  }, [filter, search]);

  const getCategoryIcon = (category: AIModel["category"]) => {
    switch (category) {
      case "featured":
        return "🌟";
      case "reasoning":
        return "🧠";
      case "coding":
        return "💻";
      case "chat":
        return "💬";
      case "multimodal":
        return "🎨";
    }
  };

  const getProviderColor = (provider: Provider) => {
    switch (provider) {
      case "openrouter":
        return "text-purple-400";
      case "groq":
        return "text-orange-400";
      case "google":
        return "text-blue-400";
      case "openai":
        return "text-green-400";
      case "custom":
        return "text-gray-400";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 bg-dark-700 hover:bg-dark-600 active:bg-dark-500 border border-dark-500 rounded-xl px-2.5 sm:px-3 py-2 transition-colors text-sm w-full max-w-[200px] sm:max-w-[280px] touch-manipulation"
      >
        {selectedModel ? (
          <>
            <span className="text-sm">{getCategoryIcon(selectedModel.category)}</span>
            <span className="font-medium truncate flex-1 text-left text-xs sm:text-sm">{selectedModel.name}</span>
            {selectedModel.isFree && (
              <span className="text-[10px] bg-emerald-glow/20 text-emerald-glow px-1.5 py-0.5 rounded-full font-medium hidden sm:inline">
                FREE
              </span>
            )}
          </>
        ) : (
          <span className="text-dark-200 text-xs sm:text-sm">Select model</span>
        )}
        <svg
          className={`w-4 h-4 text-dark-300 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Mobile overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 sm:hidden" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-auto top-16 sm:top-full sm:mt-2 sm:w-[360px] max-h-[70vh] sm:max-h-[480px] bg-dark-800 border border-dark-500 rounded-xl shadow-2xl z-50 flex flex-col animate-fade-in">
            {/* Search */}
            <div className="p-3 border-b border-dark-600">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search models..."
                className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-500 transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-1.5 p-3 border-b border-dark-600 flex-wrap">
              {(
                [
                  { id: "all" as const, label: "All" },
                  { id: "free" as const, label: "🆓 Free" },
                  { id: "openrouter" as const, label: "OpenRouter" },
                  { id: "groq" as const, label: "Groq" },
                  { id: "google" as const, label: "Google" },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors touch-manipulation ${
                    filter === id
                      ? "bg-accent-500 text-white"
                      : "bg-dark-600 text-dark-200 hover:text-white active:bg-dark-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Model List */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-2">
              {filteredModels.length === 0 ? (
                <div className="text-center text-dark-300 py-8 text-sm">
                  No models found
                </div>
              ) : (
                filteredModels.map((model) => {
                  const hasKey = hasApiKey(model.provider);
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        onSelect(model.id);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className={`w-full text-left px-3 py-3 rounded-lg transition-colors mb-1 touch-manipulation ${
                        selectedModelId === model.id
                          ? "bg-accent-500/20 border border-accent-500/40"
                          : "hover:bg-dark-600 active:bg-dark-500 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{getCategoryIcon(model.category)}</span>
                        <span className="font-medium text-sm">{model.name}</span>
                        {model.isFree && (
                          <span className="text-[10px] bg-emerald-glow/20 text-emerald-glow px-1.5 py-0.5 rounded-full font-semibold">
                            FREE
                          </span>
                        )}
                        {model.supportsVision && (
                          <span className="text-[10px]">👁️</span>
                        )}
                        {model.badge && (
                          <span className="text-[10px] text-dark-100">{model.badge}</span>
                        )}
                        {!hasKey && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full ml-auto">
                            Key needed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <span className={`text-[10px] font-medium ${getProviderColor(model.provider)}`}>
                          {PROVIDER_CONFIG[model.provider].name}
                        </span>
                        <span className="text-[10px] text-dark-300">•</span>
                        <span className="text-[10px] text-dark-300">{model.contextWindow}</span>
                      </div>
                      <p className="text-xs text-dark-300 mt-1 ml-6 line-clamp-1">
                        {model.description}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            {/* Close button for mobile */}
            <div className="p-3 border-t border-dark-600 sm:hidden">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-dark-600 hover:bg-dark-500 rounded-lg text-sm font-medium transition-colors touch-manipulation"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
