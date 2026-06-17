export interface Attachment {
  id: string;
  type: "image" | "file";
  name: string;
  mimeType: string;
  data: string; // base64 for images, text content for files
  preview?: string; // thumbnail for images
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  isStreaming?: boolean;
  attachments?: Attachment[];
  searchResults?: SearchResult[];
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  openrouterKey: string;
  groqKey: string;
  googleKey: string;
  openaiKey: string;
  customKey: string;
  customBaseUrl: string;
  tavilyKey: string;
  selectedModelId: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  webSearchEnabled: boolean;
  autoSearch: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  openrouterKey: "",
  groqKey: "",
  googleKey: "",
  openaiKey: "",
  customKey: "",
  customBaseUrl: "",
  tavilyKey: "",
  selectedModelId: "or-free-router", // Default to Free Auto-Router
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: "",
  webSearchEnabled: true,
  autoSearch: true,
};
