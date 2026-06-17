import type { Attachment } from "./types";
import { v4 as uuidv4 } from "uuid";

export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const SUPPORTED_FILE_TYPES = [
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "text/html",
  "text/css",
  "text/javascript",
  "application/pdf",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function isImageType(mimeType: string): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(mimeType);
}

export function isFileType(mimeType: string): boolean {
  return SUPPORTED_FILE_TYPES.includes(mimeType);
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix for raw base64
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function fileToText(file: File): Promise<string> {
  // For PDF, we'll extract text client-side (basic extraction)
  if (file.type === "application/pdf") {
    return extractPdfText(file);
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function extractPdfText(file: File): Promise<string> {
  // Basic PDF text extraction using pdf.js concepts
  // For simplicity, we'll read as array buffer and extract visible text
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // Convert to string and try to extract text between stream markers
  let text = "";
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const content = decoder.decode(bytes);
  
  // Simple regex to find text content in PDF
  const textMatches = content.match(/\(([^)]+)\)/g);
  if (textMatches) {
    text = textMatches
      .map((match) => match.slice(1, -1))
      .filter((t) => t.length > 1 && !/^[\\\/\d\s]+$/.test(t))
      .join(" ");
  }
  
  // If no text found, indicate it's a PDF
  if (!text.trim()) {
    return `[PDF Document: ${file.name}]\n\nNote: This PDF appears to contain primarily images or encoded content. Text extraction was limited. Please describe what you'd like to know about this document.`;
  }
  
  return `[PDF Document: ${file.name}]\n\n${text.substring(0, 50000)}`; // Limit to ~50k chars
}

export async function processFile(file: File): Promise<Attachment> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  
  const isImage = isImageType(file.type);
  const isFile = isFileType(file.type);
  
  if (!isImage && !isFile) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  
  if (isImage) {
    const base64 = await fileToBase64(file);
    return {
      id: uuidv4(),
      type: "image",
      name: file.name,
      mimeType: file.type,
      data: base64,
      preview: `data:${file.type};base64,${base64}`,
    };
  } else {
    const text = await fileToText(file);
    return {
      id: uuidv4(),
      type: "file",
      name: file.name,
      mimeType: file.type,
      data: text,
    };
  }
}

export function formatAttachmentsForPrompt(attachments: Attachment[]): string {
  const fileAttachments = attachments.filter((a) => a.type === "file");
  
  if (fileAttachments.length === 0) return "";
  
  let context = "\n\n---\n📎 **Attached Files**:\n\n";
  
  fileAttachments.forEach((attachment) => {
    context += `**File: ${attachment.name}**\n`;
    context += "```\n";
    context += attachment.data.substring(0, 30000); // Limit content
    context += "\n```\n\n";
  });
  
  context += "---\n\n";
  
  return context;
}

export function buildMessagesWithAttachments(
  content: string,
  attachments: Attachment[],
  provider: string
): { role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }[] {
  const imageAttachments = attachments.filter((a) => a.type === "image");
  const fileContent = formatAttachmentsForPrompt(attachments);
  const fullTextContent = content + fileContent;
  
  // If no images, return simple text message
  if (imageAttachments.length === 0) {
    return [{ role: "user", content: fullTextContent }];
  }
  
  // For multimodal messages, format based on provider
  // Most providers (OpenRouter, OpenAI, Google) support OpenAI's format
  const parts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
  
  // Add text content first
  parts.push({ type: "text", text: fullTextContent });
  
  // Add images
  imageAttachments.forEach((img) => {
    parts.push({
      type: "image_url",
      image_url: {
        url: `data:${img.mimeType};base64,${img.data}`,
      },
    });
  });
  
  return [{ role: "user", content: parts }];
}
