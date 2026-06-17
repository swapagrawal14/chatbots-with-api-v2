"use client";

import { useState } from "react";
import type { Settings } from "@/lib/types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) {
  const [local, setLocal] = useState<Settings>(settings);
  const [activeTab, setActiveTab] = useState<"keys" | "search" | "params" | "system">("keys");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(local);
    onClose();
  };

  const toggleShow = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const keyFields = [
    {
      key: "openrouterKey" as const,
      label: "OpenRouter API Key",
      placeholder: "sk-or-...",
      help: "Get free key at openrouter.ai/keys",
    },
    {
      key: "groqKey" as const,
      label: "Groq API Key",
      placeholder: "gsk_...",
      help: "Get free key at console.groq.com",
    },
    {
      key: "googleKey" as const,
      label: "Google AI API Key",
      placeholder: "AIza...",
      help: "Get free key at aistudio.google.com",
    },
    {
      key: "openaiKey" as const,
      label: "OpenAI API Key",
      placeholder: "sk-...",
      help: "Get key at platform.openai.com (paid)",
    },
    {
      key: "customKey" as const,
      label: "Custom API Key",
      placeholder: "Your API key...",
      help: "For custom OpenAI-compatible endpoints",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 border border-dark-500 rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-600">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </h2>
          <button onClick={onClose} className="text-dark-200 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-dark-600 overflow-x-auto">
          {[
            { id: "keys" as const, label: "API Keys", icon: "🔑" },
            { id: "search" as const, label: "Web Search", icon: "🔍" },
            { id: "params" as const, label: "Parameters", icon: "⚙️" },
            { id: "system" as const, label: "System", icon: "💬" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors whitespace-nowrap px-2 ${
                activeTab === tab.id
                  ? "text-accent-400 border-b-2 border-accent-400"
                  : "text-dark-200 hover:text-white"
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === "keys" && (
            <>
              <p className="text-sm text-dark-200 mb-4">
                🔒 API keys are stored locally in your browser. They are never sent to our servers — only directly to the AI provider.
              </p>
              {keyFields.map(({ key, label, placeholder, help }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-dark-100 mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={showKeys[key] ? "text" : "password"}
                      value={local[key]}
                      onChange={(e) => setLocal({ ...local, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-500 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow(key)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-white transition-colors"
                    >
                      {showKeys[key] ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-dark-300 mt-1">{help}</p>
                </div>
              ))}

              {/* Custom base URL */}
              <div>
                <label className="block text-sm font-medium text-dark-100 mb-1.5">
                  Custom Base URL (optional)
                </label>
                <input
                  type="text"
                  value={local.customBaseUrl}
                  onChange={(e) => setLocal({ ...local, customBaseUrl: e.target.value })}
                  placeholder="https://your-api.com/v1/chat/completions"
                  className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-500 transition-colors"
                />
                <p className="text-xs text-dark-300 mt-1">For custom OpenAI-compatible endpoints</p>
              </div>
            </>
          )}

          {activeTab === "search" && (
            <>
              <div className="bg-cyan-glow/10 border border-cyan-glow/30 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">🔎</span>
                  <div>
                    <h3 className="font-medium text-cyan-glow text-sm">How Tavily works in NexChat</h3>
                    <p className="text-xs text-dark-200 mt-1">
                      NexChat searches the web first, then injects those fresh results into the prompt before sending it to your selected AI model. That means Owl Alpha, Nex-N2 Pro, Gemma, GPT-OSS, or any other model can answer current questions using Tavily results.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-100 mb-1.5">
                  Tavily API Key <span className="text-emerald-glow font-normal">recommended</span>
                </label>
                <div className="relative">
                  <input
                    type={showKeys["tavilyKey"] ? "text" : "password"}
                    value={local.tavilyKey}
                    onChange={(e) => setLocal({ ...local, tavilyKey: e.target.value })}
                    placeholder="tvly-..."
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-500 transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow("tavilyKey")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-white transition-colors"
                  >
                    {showKeys["tavilyKey"] ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-dark-300 mt-1">
                  Your key is stored locally in this browser. Tavily gives stronger, cleaner current web results than the built-in fallback.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 mt-4">
                {[
                  "What is the weather in my city right now? Use live sources.",
                  "Summarize today’s top India tech news with sources.",
                  "Compare current prices of iPhone 16 vs Pixel 10 in India.",
                  "Find the latest OpenRouter free models and list only zero-cost ones.",
                  "Research this company’s latest funding/news and cite sources.",
                ].map((example) => (
                  <div key={example} className="text-xs text-dark-200 bg-dark-700 border border-dark-500 rounded-lg p-2.5">
                    <span className="text-cyan-glow">Try:</span> {example}
                  </div>
                ))}
              </div>

              <div className="space-y-3 mt-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={local.webSearchEnabled}
                      onChange={(e) => setLocal({ ...local, webSearchEnabled: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${local.webSearchEnabled ? "bg-cyan-glow" : "bg-dark-500"}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform mt-1 ${local.webSearchEnabled ? "translate-x-5" : "translate-x-1"}`} />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-dark-100 group-hover:text-white transition-colors">
                      Auto Web Search
                    </span>
                    <p className="text-xs text-dark-300">When enabled, NexChat searches automatically for current topics.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={local.autoSearch}
                      onChange={(e) => setLocal({ ...local, autoSearch: e.target.checked })}
                      className="sr-only"
                      disabled={!local.webSearchEnabled}
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${local.autoSearch && local.webSearchEnabled ? "bg-cyan-glow" : "bg-dark-500"} ${!local.webSearchEnabled ? "opacity-50" : ""}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform mt-1 ${local.autoSearch && local.webSearchEnabled ? "translate-x-5" : "translate-x-1"}`} />
                    </div>
                  </div>
                  <div className={!local.webSearchEnabled ? "opacity-50" : ""}>
                    <span className="text-sm font-medium text-dark-100 group-hover:text-white transition-colors">
                      Auto-detect Search Queries
                    </span>
                    <p className="text-xs text-dark-300">Detects queries like weather, today, latest, price, news, current, and 2026.</p>
                  </div>
                </label>
              </div>
            </>
          )}

          {activeTab === "params" && (
            <>
              <div>
                <label className="block text-sm font-medium text-dark-100 mb-1.5">
                  Temperature: {local.temperature.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={local.temperature}
                  onChange={(e) => setLocal({ ...local, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-accent-500"
                />
                <div className="flex justify-between text-xs text-dark-300 mt-1">
                  <span>Precise (0)</span>
                  <span>Creative (2)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-100 mb-1.5">
                  Max Tokens: {local.maxTokens}
                </label>
                <input
                  type="range"
                  min="256"
                  max="16384"
                  step="256"
                  value={local.maxTokens}
                  onChange={(e) => setLocal({ ...local, maxTokens: parseInt(e.target.value) })}
                  className="w-full accent-accent-500"
                />
                <div className="flex justify-between text-xs text-dark-300 mt-1">
                  <span>Short (256)</span>
                  <span>Long (16384)</span>
                </div>
              </div>
            </>
          )}

          {activeTab === "system" && (
            <div>
              <label className="block text-sm font-medium text-dark-100 mb-1.5">
                System Prompt (optional)
              </label>
              <textarea
                value={local.systemPrompt}
                onChange={(e) => setLocal({ ...local, systemPrompt: e.target.value })}
                placeholder="You are a helpful assistant..."
                rows={8}
                className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-500 transition-colors resize-none"
              />
              <p className="text-xs text-dark-300 mt-1">
                Set a custom system prompt to control the AI&apos;s personality and behavior.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-dark-600">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-dark-500 text-dark-100 hover:text-white hover:border-dark-400 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-white transition-colors text-sm font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
