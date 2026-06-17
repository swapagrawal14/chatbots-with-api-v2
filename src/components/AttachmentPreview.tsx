"use client";

import type { Attachment } from "@/lib/types";

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove?: (id: string) => void;
  size?: "sm" | "md" | "lg";
  showRemove?: boolean;
}

export default function AttachmentPreview({
  attachments,
  onRemove,
  size = "md",
  showRemove = true,
}: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  };

  const iconSize = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) {
      return (
        <svg className={`${iconSize[size]} text-red-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    if (mimeType.includes("json")) {
      return (
        <svg className={`${iconSize[size]} text-yellow-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    }
    if (mimeType.includes("csv")) {
      return (
        <svg className={`${iconSize[size]} text-green-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className={`${iconSize[size]} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden bg-dark-600 border border-dark-500 group`}
        >
          {attachment.type === "image" && attachment.preview ? (
            <img
              src={attachment.preview}
              alt={attachment.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-1">
              {getFileIcon(attachment.mimeType)}
              <span className="text-[8px] text-dark-200 text-center truncate w-full mt-1 px-1">
                {attachment.name.length > 12
                  ? attachment.name.substring(0, 10) + "..."
                  : attachment.name}
              </span>
            </div>
          )}

          {showRemove && onRemove && (
            <button
              onClick={() => onRemove(attachment.id)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
