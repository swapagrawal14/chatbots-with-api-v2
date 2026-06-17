"use client";

import { memo, useState, useCallback, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage as ChatMessageType } from "@/lib/types";
import AttachmentPreview from "./AttachmentPreview";
import SearchResults from "./SearchResults";

/* ─── Code block with copy button ─── */
function CodeBlock({ children, className }: { children: ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");
  const lang = className?.replace("language-", "") || "";

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="relative group/code">
      {lang && (
        <div className="absolute top-0 left-0 px-2.5 py-1 text-[10px] text-dark-300 bg-dark-800 rounded-br-lg rounded-tl-[0.45rem] border-b border-r border-dark-500 uppercase tracking-wide">
          {lang}
        </div>
      )}
      <button
        type="button"
        onClick={copy}
        className="absolute top-1.5 right-1.5 px-2 py-1 rounded-md text-[10px] bg-dark-600 hover:bg-dark-500 text-dark-200 hover:text-white opacity-0 group-hover/code:opacity-100 transition-all flex items-center gap-1"
      >
        {copied ? "✓ Copied" : "Copy"}
      </button>
      <pre className={className}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

/* ─── Separate thinking from response ─── */
function parseThinking(content: string): { thinking: string; answer: string } {
  // Match <think>...</think> blocks (DeepSeek R1, QwQ, etc.)
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  if (thinkMatch) {
    const thinking = thinkMatch[1].trim();
    const answer = content.replace(/<think>[\s\S]*?<\/think>/, "").trim();
    return { thinking, answer };
  }
  return { thinking: "", answer: content };
}

interface ChatMessageProps {
  message: ChatMessageType;
  onRegenerate?: () => void;
  isLast?: boolean;
}

function ChatMessageComponent({ message, onRegenerate, isLast }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { thinking, answer } = isUser ? { thinking: "", answer: message.content } : parseThinking(message.content);

  return (
    <div className="animate-fade-in">
      {/* Search Results (shown before assistant messages) */}
      {!isUser && message.searchResults && message.searchResults.length > 0 && (
        <div className="mb-2 ml-11">
          <SearchResults results={message.searchResults} />
        </div>
      )}

      <div className={`flex gap-2.5 sm:gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-accent-500 to-cyan-glow flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        )}

        <div className="flex flex-col max-w-[85%] sm:max-w-[80%]">
          {/* User attachments */}
          {isUser && message.attachments && message.attachments.length > 0 && (
            <div className="mb-2 flex justify-end">
              <AttachmentPreview attachments={message.attachments} size="md" showRemove={false} />
            </div>
          )}

          <div
            className={`group relative ${
              isUser
                ? "bg-accent-500 text-white rounded-2xl rounded-br-md px-3.5 sm:px-4 py-2.5 sm:py-3"
                : "bg-dark-700 text-gray-100 rounded-2xl rounded-bl-md px-3.5 sm:px-4 py-2.5 sm:py-3"
            }`}
          >
            {message.isStreaming && !message.content ? (
              <div className="flex gap-1.5 py-1 px-1">
                <div className="w-2 h-2 bg-dark-200 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-dark-200 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-dark-200 rounded-full typing-dot" />
              </div>
            ) : isUser ? (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            ) : (
              <div>
                {/* Thinking block */}
                {thinking && (
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => setShowThinking(!showThinking)}
                      className="flex items-center gap-1.5 text-xs text-cyan-glow hover:text-cyan-400 transition-colors mb-1"
                    >
                      <span className={message.isStreaming ? "animate-think" : ""}>🧠</span>
                      <span>{showThinking ? "Hide thinking" : "Show thinking"}</span>
                      <span className="text-dark-400">({thinking.split(/\s+/).length} words)</span>
                    </button>
                    {showThinking && (
                      <div className="thinking-block whitespace-pre-wrap text-xs">
                        {thinking}
                      </div>
                    )}
                  </div>
                )}
                <div className="prose-chat text-sm">
                  <ReactMarkdown
                    components={{
                      pre: ({ children }) => <>{children}</>,
                      code: ({ className, children, ...props }) => {
                        const isBlock = className?.startsWith("language-") || String(children).includes("\n");
                        if (isBlock) {
                          return <CodeBlock className={className}>{children}</CodeBlock>;
                        }
                        return <code className={className} {...props}>{children}</code>;
                      },
                    }}
                  >
                    {answer}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!message.isStreaming && message.content && !isUser && (
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-dark-600/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[11px] text-dark-300 hover:text-white px-2 py-0.5 rounded hover:bg-dark-600 transition-colors flex items-center gap-1"
                >
                  {copied ? "✓ Copied" : "📋 Copy"}
                </button>
                {isLast && onRegenerate && (
                  <button
                    type="button"
                    onClick={onRegenerate}
                    className="text-[11px] text-dark-300 hover:text-white px-2 py-0.5 rounded hover:bg-dark-600 transition-colors flex items-center gap-1"
                  >
                    🔄 Regenerate
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {isUser && (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-emerald-glow to-cyan-glow flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ChatMessageComponent);
