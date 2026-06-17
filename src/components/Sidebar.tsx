"use client";

import { useState } from "react";
import type { Conversation } from "@/lib/types";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onExport: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelect,
  onNew,
  onDelete,
  onClearAll,
  onExport,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = (id: string) => {
    if (deleteId === id) { onDelete(id); setDeleteId(null); }
    else { setDeleteId(id); setTimeout(() => setDeleteId(null), 3000); }
  };

  const handleClearAll = () => {
    if (confirmClear) { onClearAll(); setConfirmClear(false); }
    else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={onToggle} />}
      <aside className={`fixed md:relative z-40 h-full bg-dark-800 border-r border-dark-600 flex flex-col transition-transform duration-300 ease-out w-72 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:border-0"}`}>
        <div className={`flex flex-col h-full ${isOpen ? "opacity-100" : "opacity-0 md:hidden"} transition-opacity duration-200 w-72`}>
          {/* Header */}
          <div className="p-3 border-b border-dark-600 flex-shrink-0">
            <div className="flex items-center justify-between mb-3 md:hidden">
              <span className="font-bold text-lg">Nex<span className="text-accent-400">Chat</span></span>
              <button type="button" onClick={onToggle} className="p-2 hover:bg-dark-600 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <button type="button" onClick={onNew} className="w-full flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 active:bg-accent-700 text-white rounded-xl py-2.5 transition-colors text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Chat
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-2">
            {conversations.length === 0 ? (
              <div className="text-center text-dark-300 py-12 text-sm px-4">
                <div className="text-3xl mb-3">💬</div>
                <p className="font-medium">No conversations yet</p>
                <p className="text-xs mt-1 text-dark-400">Start a new chat!</p>
              </div>
            ) : conversations.map((conv) => (
              <div
                key={conv.id}
                className={`relative flex items-center rounded-xl px-3 py-2.5 mb-1 cursor-pointer transition-colors group ${currentConversationId === conv.id ? "bg-dark-600 border border-dark-500" : "hover:bg-dark-700 active:bg-dark-600 border border-transparent"}`}
                onClick={() => onSelect(conv.id)}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm font-medium truncate">{conv.title}</p>
                  <p className="text-[11px] text-dark-300 mt-0.5">{formatDate(conv.updatedAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(conv.id); }}
                  className={`p-1.5 rounded-lg transition-all flex-shrink-0 opacity-0 group-hover:opacity-100 ${deleteId === conv.id ? "bg-red-500/20 text-red-400 opacity-100" : "text-dark-300 hover:text-red-400"}`}
                  title={deleteId === conv.id ? "Click again to confirm" : "Delete"}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-dark-600 flex-shrink-0 space-y-1.5">
            {conversations.length > 0 && (
              <div className="flex gap-1.5">
                <button type="button" onClick={onExport} className="flex-1 flex items-center justify-center gap-1.5 text-xs text-dark-200 hover:text-white py-2 rounded-lg hover:bg-dark-700 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Export
                </button>
                <button type="button" onClick={handleClearAll} className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition-colors ${confirmClear ? "bg-red-500/20 text-red-400" : "text-dark-200 hover:text-white hover:bg-dark-700"}`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  {confirmClear ? "Confirm?" : "Clear all"}
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 text-[11px] text-dark-400 px-1">
              <div className="w-1.5 h-1.5 bg-emerald-glow rounded-full animate-pulse" />
              <span>{conversations.length} chat{conversations.length !== 1 ? "s" : ""}</span>
              <span className="ml-auto">⌘N new</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
