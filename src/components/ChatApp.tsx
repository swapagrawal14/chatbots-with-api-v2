"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "./Sidebar";
import ModelSelector from "./ModelSelector";
import SettingsModal from "./SettingsModal";
import ChatMessage from "./ChatMessage";
import AttachmentPreview from "./AttachmentPreview";
import SearchResults from "./SearchResults";
import type { ChatMessage as ChatMessageType, Conversation, Settings, Attachment, SearchResult } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { MODELS, getModelById, PROVIDER_CONFIG, type Provider } from "@/lib/models";
import { processFile, buildMessagesWithAttachments, formatAttachmentsForPrompt, SUPPORTED_IMAGE_TYPES, SUPPORTED_FILE_TYPES } from "@/lib/files";
import { searchWeb, formatSearchResultsForContext, shouldSearch } from "@/lib/search";

const SETTINGS_KEY = "nexchat-settings";
const CONVERSATIONS_KEY = "nexchat-conversations";
const MESSAGES_KEY = "nexchat-messages";

function loadSettings(): Settings { if (typeof window==="undefined") return DEFAULT_SETTINGS; try { const s=localStorage.getItem(SETTINGS_KEY); if(s) return {...DEFAULT_SETTINGS,...JSON.parse(s)}; } catch{} return DEFAULT_SETTINGS; }
function saveSettingsLS(s: Settings) { if(typeof window!=="undefined") localStorage.setItem(SETTINGS_KEY,JSON.stringify(s)); }
function loadConversations(): Conversation[] { if(typeof window==="undefined") return []; try { const s=localStorage.getItem(CONVERSATIONS_KEY); if(s) return JSON.parse(s); } catch{} return []; }
function saveConversationsLS(c: Conversation[]) { if(typeof window!=="undefined") localStorage.setItem(CONVERSATIONS_KEY,JSON.stringify(c)); }
function loadMessages(id: string): ChatMessageType[] { if(typeof window==="undefined") return []; try { const s=localStorage.getItem(`${MESSAGES_KEY}-${id}`); if(s) return JSON.parse(s).map((m:ChatMessageType)=>({...m,createdAt:new Date(m.createdAt)})); } catch{} return []; }
function saveMsgs(id: string, msgs: ChatMessageType[]) { if(typeof window!=="undefined") localStorage.setItem(`${MESSAGES_KEY}-${id}`,JSON.stringify(msgs)); }
function delMsgs(id: string) { if(typeof window!=="undefined") localStorage.removeItem(`${MESSAGES_KEY}-${id}`); }

export default function ChatApp() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [manualSearch, setManualSearch] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { setMounted(true); setSettings(loadSettings()); setConversations(loadConversations()); }, []);
  useEffect(() => { if(mounted) saveSettingsLS(settings); }, [settings, mounted]);
  useEffect(() => { if(mounted) saveConversationsLS(conversations); }, [conversations, mounted]);
  useEffect(() => { if(mounted && currentId) saveMsgs(currentId, messages); }, [messages, currentId, mounted]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") { e.preventDefault(); handleNewChat(); }
      if ((e.metaKey || e.ctrlKey) && e.key === ",") { e.preventDefault(); setSettingsOpen(true); }
      if (e.key === "Escape" && settingsOpen) { setSettingsOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsOpen]);

  // Paste images from clipboard
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            processFile(file)
              .then(att => setAttachments(prev => [...prev, att]))
              .catch(err => setError(err instanceof Error ? err.message : "Failed to paste image"));
          }
        }
      }
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, []);

  const createConv = (): string => {
    const model = getModelById(settings.selectedModelId);
    const conv: Conversation = { id: uuidv4(), title: "New Chat", model: model?.modelId || "", provider: model?.provider || "openrouter", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setConversations(prev => [conv, ...prev]);
    setCurrentId(conv.id);
    return conv.id;
  };

  const getApiKey = useCallback((p: Provider): string => {
    const map: Record<Provider, keyof Settings> = { openrouter: "openrouterKey", groq: "groqKey", google: "googleKey", openai: "openaiKey", custom: "customKey" };
    return settings[map[p]] as string;
  }, [settings]);

  const hasApiKey = useCallback((p: Provider) => getApiKey(p).length > 0, [getApiKey]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    for (const file of Array.from(e.target.files)) {
      try {
        const att = await processFile(file);
        setAttachments(prev => [...prev, att]);
      } catch (err) { setError(err instanceof Error ? err.message : "File error"); }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const doSend = async (content: string, regenerate = false) => {
    if (!content.trim() || isLoading) return;
    const model = getModelById(settings.selectedModelId);
    if (!model) { setError("Select a model first."); return; }
    const apiKey = getApiKey(model.provider);
    if (!apiKey) { setError(`Add your ${model.provider} API key in Settings.`); setSettingsOpen(true); return; }
    if (attachments.some(a => a.type === "image") && !model.supportsVision) { setError(`${model.name} doesn't support images. Use a Vision model.`); return; }

    setError(null); setInputValue(""); setIsLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    let convId = currentId;
    if (!convId) convId = createConv();

    // Search
    let searchResults: SearchResult[] = [];
    if (manualSearch || (settings.webSearchEnabled && settings.autoSearch && shouldSearch(content))) {
      setIsSearching(true);
      try { searchResults = await searchWeb(content, settings.tavilyKey); } catch {}
      setIsSearching(false);
    }

    // User message
    const currentAttachments = [...attachments];
    const userMsg: ChatMessageType = { id: uuidv4(), role: "user", content, createdAt: new Date(), attachments: currentAttachments.length > 0 ? currentAttachments : undefined };

    let updatedMsgs: ChatMessageType[];
    if (regenerate) {
      // Remove last assistant message, keep the rest
      updatedMsgs = [...messages];
    } else {
      updatedMsgs = [...messages, userMsg];
      if (messages.length === 0) {
        setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: content.substring(0, 80) + (content.length > 80 ? "..." : ""), updatedAt: new Date().toISOString() } : c));
      }
    }
    setMessages(updatedMsgs);
    setAttachments([]); setManualSearch(false);

    const assistantId = uuidv4();
    setMessages([...updatedMsgs, { id: assistantId, role: "assistant", content: "", createdAt: new Date(), isStreaming: true, searchResults: searchResults.length > 0 ? searchResults : undefined }]);

    // Build API messages
    const apiMsgs: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [];
    let sys = settings.systemPrompt || "You are a helpful AI assistant.";
    if (searchResults.length > 0) sys += "\n\nYou have access to real-time web search results. Use them for accurate, current answers. Cite sources with [1], [2] etc.";
    apiMsgs.push({ role: "system", content: sys });

    for (const msg of updatedMsgs) {
      if (msg.role === "assistant") { apiMsgs.push({ role: "assistant", content: msg.content }); continue; }
      if (msg.attachments?.some(a => a.type === "image")) {
        apiMsgs.push(...buildMessagesWithAttachments(msg.content, msg.attachments, model.provider));
      } else {
        let c = msg.content;
        if (msg.attachments) c += formatAttachmentsForPrompt(msg.attachments);
        apiMsgs.push({ role: "user", content: c });
      }
    }

    // Add search context to the last user message if we're not regenerating
    if (!regenerate && searchResults.length > 0) {
      const lastIdx = apiMsgs.length - 1;
      const last = apiMsgs[lastIdx];
      if (typeof last.content === "string") {
        apiMsgs[lastIdx] = { ...last, content: formatSearchResultsForContext(searchResults) + last.content };
      }
    }

    const baseUrl = model.provider === "custom" && settings.customBaseUrl ? settings.customBaseUrl : PROVIDER_CONFIG[model.provider].baseUrl;

    try {
      abortRef.current = new AbortController();
      const headers: Record<string, string> = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
      if (model.provider === "openrouter") { headers["HTTP-Referer"] = window.location.origin; headers["X-Title"] = "NexChat AI"; }

      const res = await fetch(baseUrl, {
        method: "POST", headers,
        body: JSON.stringify({ model: model.modelId, messages: apiMsgs, temperature: settings.temperature, max_tokens: settings.maxTokens, stream: true }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const txt = await res.text();
        let msg = `API Error (${res.status})`;
        try { const j = JSON.parse(txt); msg = j.error?.message || j.message || msg; } catch { msg = txt || msg; }
        throw new Error(msg);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (d === "[DONE]") continue;
          try {
            const delta = JSON.parse(d).choices?.[0]?.delta?.content || "";
            if (delta) { full += delta; setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: full } : m)); }
          } catch {}
        }
      }
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false, content: full } : m));
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m));
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
        setMessages(prev => prev.filter(m => m.id !== assistantId));
      }
    } finally { setIsLoading(false); abortRef.current = null; }
  };

  const handleSend = () => doSend(inputValue.trim());
  const handleStop = () => abortRef.current?.abort();

  const handleRegenerate = () => {
    // Find the last user message and resend
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    if (!lastUser) return;
    // Remove the last assistant msg
    setMessages(prev => {
      const idx = prev.length - 1;
      if (idx >= 0 && prev[idx].role === "assistant") return prev.slice(0, idx);
      return prev;
    });
    setTimeout(() => doSend(lastUser.content, true), 100);
  };

  const handleNewChat = () => { setCurrentId(null); setMessages([]); setAttachments([]); setError(null); setSidebarOpen(false); };
  const handleSelectConv = (id: string) => { setCurrentId(id); setMessages(loadMessages(id)); setAttachments([]); setError(null); setSidebarOpen(false); };
  const handleDeleteConv = (id: string) => { delMsgs(id); setConversations(prev => prev.filter(c => c.id !== id)); if (currentId === id) { setCurrentId(null); setMessages([]); } };
  const handleClearAll = () => { conversations.forEach(c => delMsgs(c.id)); setConversations([]); setCurrentId(null); setMessages([]); };

  const handleExport = () => {
    if (!currentId || messages.length === 0) return;
    const conv = conversations.find(c => c.id === currentId);
    let md = `# ${conv?.title || "Chat"}\n\n`;
    messages.forEach(m => { md += `## ${m.role === "user" ? "You" : "Assistant"}\n\n${m.content}\n\n---\n\n`; });
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${(conv?.title || "chat").replace(/[^a-z0-9]/gi, "_")}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleModelChange = (id: string) => setSettings(prev => ({ ...prev, selectedModelId: id }));
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setInputValue(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`; };

  const selectedModel = getModelById(settings.selectedModelId);
  const acceptedFileTypes = [...SUPPORTED_IMAGE_TYPES, ...SUPPORTED_FILE_TYPES].join(",");
  const wordCount = inputValue.trim() ? inputValue.trim().split(/\s+/).length : 0;

  const quickPrompts = [
    { emoji: "🌤️", text: "What's the weather in my city right now? Ask me for my location if needed, then use live sources.", search: true },
    { emoji: "🇮🇳", text: "Give me today’s top India news with source links and a 5-bullet summary.", search: true },
    { emoji: "💰", text: "Compare current prices of iPhone 16, Pixel 10, and Galaxy S26 in India with sources.", search: true },
    { emoji: "🧪", text: "Find the latest free OpenRouter models with zero input/output cost and cite sources.", search: true },
    { emoji: "📈", text: "Research today’s market sentiment for NVIDIA and summarize risks with sources.", search: true },
    { emoji: "📝", text: "Write a Python quicksort with explanation" },
  ];

  if (!mounted) return (
    <div className="flex h-screen items-center justify-center bg-dark-900">
      <div className="animate-pulse-glow w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-cyan-glow flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-dark-900">
      <input ref={fileInputRef} type="file" accept={acceptedFileTypes} multiple onChange={handleFileSelect} className="hidden" />

      <Sidebar
        conversations={conversations} currentConversationId={currentId}
        onSelect={handleSelectConv} onNew={handleNewChat} onDelete={handleDeleteConv}
        onClearAll={handleClearAll} onExport={handleExport}
        isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="relative z-30 flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3 border-b border-dark-600 bg-dark-800 flex-shrink-0">
          <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-dark-600 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-accent-500 to-cyan-glow flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="font-bold text-base hidden sm:block">Nex<span className="text-accent-400">Chat</span></span>
          </div>
          <div className="flex-1 flex justify-center min-w-0 px-1">
            <ModelSelector selectedModelId={settings.selectedModelId} onSelect={handleModelChange} hasApiKey={hasApiKey} />
          </div>
          {settings.webSearchEnabled && (
            <div className="hidden md:flex items-center gap-1 text-[11px] text-cyan-glow bg-cyan-glow/10 px-2 py-1 rounded-full flex-shrink-0">🔍 Auto-search</div>
          )}
          <button type="button" onClick={() => setSettingsOpen(true)} className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-dark-200 hover:text-white flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </header>

        {/* Messages */}
        <div className="relative z-0 flex-1 overflow-y-auto overscroll-contain">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-full px-4 py-6">
              <div className="max-w-2xl w-full text-center">
                <div className="mb-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent-500 to-cyan-glow flex items-center justify-center mb-4 animate-pulse-glow">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to <span className="text-accent-400">NexChat</span></h1>
                  <p className="text-dark-200 text-sm max-w-md mx-auto">AI chat with real-time web search, file uploads & {MODELS.filter(m => m.isFree).length}+ free models.</p>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <span className="text-xs bg-cyan-glow/15 text-cyan-glow px-3 py-1.5 rounded-full">🔍 Live Search</span>
                  <span className="text-xs bg-emerald-glow/15 text-emerald-glow px-3 py-1.5 rounded-full">🖼️ Vision</span>
                  <span className="text-xs bg-accent-500/15 text-accent-300 px-3 py-1.5 rounded-full">📎 Files</span>
                  <span className="text-xs bg-purple-500/15 text-purple-300 px-3 py-1.5 rounded-full">🧠 Reasoning</span>
                  <span className="text-xs bg-amber-500/15 text-amber-300 px-3 py-1.5 rounded-full">📋 Paste Images</span>
                </div>

                {/* Model card */}
                {selectedModel && (
                  <div className="bg-dark-700 border border-dark-500 rounded-xl p-4 mb-6 text-left mx-2 sm:mx-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-semibold text-sm">{selectedModel.name}</span>
                      {selectedModel.isFree && <span className="text-[10px] bg-emerald-glow/20 text-emerald-glow px-2 py-0.5 rounded-full font-medium">FREE</span>}
                      {selectedModel.supportsVision && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">👁️ Vision</span>}
                      {selectedModel.badge && <span className="text-[10px] text-dark-200">{selectedModel.badge}</span>}
                    </div>
                    <p className="text-xs text-dark-200 mb-1.5">{selectedModel.description}</p>
                    <div className="flex gap-3 text-[11px] text-dark-300">
                      <span>📏 {selectedModel.contextWindow}</span>
                      <span>🏢 {selectedModel.provider}</span>
                    </div>
                    {!hasApiKey(selectedModel.provider) && (
                      <div className="mt-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                        <p className="text-xs text-amber-400">⚠️ Add your {selectedModel.provider} API key in <button type="button" onClick={() => setSettingsOpen(true)} className="underline font-medium">Settings</button></p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-4 mx-2 sm:mx-0 rounded-xl border border-cyan-glow/30 bg-cyan-glow/10 p-3 text-left">
                  <div className="flex items-start gap-2">
                    <span className="text-base">🔎</span>
                    <p className="text-xs text-dark-100">
                      <span className="text-cyan-glow font-medium">Tavily mode:</span> paste your Tavily key in Settings → Web Search. Then any model can use live sources for weather, news, prices, stocks, docs, and current events.
                    </p>
                  </div>
                </div>

                {/* Quick prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2 sm:px-0">
                  {quickPrompts.map((p, i) => (
                    <button key={i} type="button" onClick={() => { setInputValue(p.text); if (p.search) setManualSearch(true); textareaRef.current?.focus(); }}
                      className="flex items-center gap-2 bg-dark-700 hover:bg-dark-600 active:bg-dark-500 border border-dark-500 rounded-xl px-4 py-3 text-left text-sm transition-colors group">
                      <span className="text-lg">{p.emoji}</span>
                      <span className="text-dark-200 group-hover:text-white transition-colors flex-1 text-left">{p.text}</span>
                    </button>
                  ))}
                </div>

                {/* API key links */}
                <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3 px-2">
                  {[{ name: "OpenRouter", url: "https://openrouter.ai/keys", color: "text-purple-400" }, { name: "Groq", url: "https://console.groq.com", color: "text-orange-400" }, { name: "Google AI", url: "https://aistudio.google.com", color: "text-blue-400" }, { name: "Tavily Search", url: "https://tavily.com", color: "text-cyan-glow" }].map(({ name, url, color }) => (
                    <a key={name} href={url} target="_blank" rel="noopener noreferrer" className={`text-xs ${color} hover:underline flex items-center gap-1 px-2 py-1`}>
                      🔑 {name} <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isLast={i === messages.length - 1 && msg.role === "assistant"}
                  onRegenerate={!isLoading ? handleRegenerate : undefined}
                />
              ))}
              {isSearching && <SearchResults results={[]} isLoading />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-3 sm:px-4 py-1.5 flex-shrink-0 animate-fade-in">
            <div className="max-w-3xl mx-auto bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <span className="text-red-400 text-sm">⚠️</span>
              <p className="text-xs sm:text-sm text-red-300 flex-1 line-clamp-2">{error}</p>
              <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-300 p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
          </div>
        )}

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="px-3 sm:px-4 py-1.5 flex-shrink-0 animate-fade-in">
            <div className="max-w-3xl mx-auto bg-dark-700/50 border border-dark-500 rounded-xl p-2.5">
              <div className="flex items-center gap-2 mb-1.5"><span className="text-xs text-dark-300">📎 {attachments.length} file(s)</span></div>
              <AttachmentPreview attachments={attachments} onRemove={(id) => setAttachments(prev => prev.filter(a => a.id !== id))} size="sm" />
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-dark-600 bg-dark-800 px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-1.5 sm:gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading}
                className="p-2.5 sm:p-3 hover:bg-dark-600 active:bg-dark-500 text-dark-300 hover:text-white rounded-xl transition-colors flex-shrink-0 disabled:opacity-50" title="Attach files or images (or Ctrl+V to paste)">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </button>

              <button type="button" onClick={() => setManualSearch(!manualSearch)} disabled={isLoading}
                className={`p-2.5 sm:p-3 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50 ${manualSearch ? "bg-cyan-glow/20 text-cyan-glow ring-1 ring-cyan-glow/40" : "hover:bg-dark-600 active:bg-dark-500 text-dark-300 hover:text-white"}`}
                title={manualSearch ? "Web search ON" : "Click to search web"}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>

              <div className="flex-1 min-w-0 bg-dark-700 border border-dark-500 rounded-xl focus-within:border-accent-500 transition-colors cursor-text" onClick={() => textareaRef.current?.focus()}>
                <textarea ref={textareaRef} value={inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown}
                  placeholder={selectedModel ? `Message ${selectedModel.name}...` : "Select a model..."}
                  rows={1} disabled={isLoading}
                  className="w-full bg-transparent text-sm resize-none focus:outline-none placeholder-dark-300 max-h-[150px] sm:max-h-[200px] px-3 sm:px-4 py-2.5 sm:py-3 block"
                  style={{ minHeight: "44px" }} />
              </div>

              {isLoading ? (
                <button type="button" onClick={handleStop} className="p-2.5 sm:p-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                </button>
              ) : (
                <button type="button" onClick={handleSend} disabled={!inputValue.trim()}
                  className={`p-2.5 sm:p-3 rounded-xl transition-colors flex-shrink-0 ${inputValue.trim() ? "bg-accent-500 hover:bg-accent-600 active:bg-accent-700 text-white" : "bg-dark-600 text-dark-400 cursor-not-allowed"}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" /></svg>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mt-1.5 px-1 gap-2">
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-dark-400">
                {selectedModel?.isFree ? "🆓" : "💰"} {selectedModel?.contextWindow || "—"}
                {selectedModel?.supportsVision && " · 👁️"}
                {manualSearch && <span className="text-cyan-glow ml-1">· 🔍 Search</span>}
                {wordCount > 0 && <span className="ml-1">· {wordCount}w</span>}
              </div>
              <p className="text-[10px] sm:text-[11px] text-dark-400 hidden sm:block">Shift+Enter new line · Ctrl+V paste image</p>
            </div>
          </div>
        </div>
      </main>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} settings={settings} onSave={setSettings} />
    </div>
  );
}
