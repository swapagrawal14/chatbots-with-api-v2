"use client";

import type { SearchResult } from "@/lib/types";

interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
}

export default function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="bg-dark-700/50 border border-dark-500 rounded-xl p-4 mb-4 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-dark-200">
          <div className="w-4 h-4 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" />
          <span>Searching the web for current information...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="bg-dark-700/50 border border-dark-500 rounded-xl p-4 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-cyan-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-sm font-medium text-cyan-glow">Web Search Results</span>
        <span className="text-xs text-dark-300">({results.length} sources)</span>
      </div>

      <div className="space-y-2">
        {results.map((result, index) => (
          <a
            key={index}
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 rounded-lg bg-dark-600/50 hover:bg-dark-600 transition-colors group"
          >
            <div className="flex items-start gap-2">
              <span className="text-xs text-dark-400 font-mono">[{index + 1}]</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-accent-300 group-hover:text-accent-400 truncate">
                  {result.title}
                </h4>
                <p className="text-xs text-dark-300 line-clamp-2 mt-0.5">
                  {result.snippet}
                </p>
                <span className="text-[10px] text-dark-400 truncate block mt-1">
                  {result.url}
                </span>
              </div>
              <svg className="w-3 h-3 text-dark-400 group-hover:text-accent-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
