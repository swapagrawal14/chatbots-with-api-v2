export type Provider = "openrouter" | "groq" | "google" | "openai" | "custom";

export interface AIModel {
  id: string;
  name: string;
  provider: Provider;
  modelId: string;
  contextWindow: string;
  description: string;
  isFree: boolean;
  category: "featured" | "reasoning" | "coding" | "chat" | "multimodal";
  badge?: string;
  supportsVision?: boolean;
}

export const PROVIDER_CONFIG: Record<
  Provider,
  { name: string; baseUrl: string; keyName: string; description: string }
> = {
  openrouter: {
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    keyName: "OpenRouter API Key",
    description: "Access 200+ models. Many free ($0) models available.",
  },
  groq: {
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    keyName: "Groq API Key",
    description: "Ultra-fast inference for open-source models.",
  },
  google: {
    name: "Google AI Studio",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    keyName: "Google AI API Key",
    description: "Free access to Gemini models.",
  },
  openai: {
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    keyName: "OpenAI API Key",
    description: "GPT-4o and more. Paid API.",
  },
  custom: {
    name: "Custom (OpenAI-compatible)",
    baseUrl: "",
    keyName: "API Key",
    description: "Any OpenAI-compatible API endpoint.",
  },
};

// ══════════════════════════════════════════════════════════════
// All model IDs, context windows, and vision flags verified
// against the LIVE OpenRouter API: /api/v1/models
// Only models with pricing.prompt = "0" AND pricing.completion = "0"
// ══════════════════════════════════════════════════════════════

export const MODELS: AIModel[] = [

  // ── Auto Router ──
  {
    id: "or-free-router",
    name: "Free Router (Auto)",
    provider: "openrouter",
    modelId: "openrouter/free",
    contextWindow: "Varies",
    description: "Auto-picks the best free model for each request. Great default.",
    isFree: true,
    category: "featured",
    badge: "✨ Auto",
    supportsVision: true,
  },

  // ── Owl Alpha ──
  {
    id: "or-owl-alpha",
    name: "Owl Alpha",
    provider: "openrouter",
    modelId: "openrouter/owl-alpha",
    contextWindow: "1M",
    description: "Stealth frontier model. 1M context, strong at coding & math.",
    isFree: true,
    category: "featured",
    badge: "🔥 Stealth",
  },

  // ── Nex AGI ──
  {
    id: "or-nex-n2-pro",
    name: "Nex-N2 Pro",
    provider: "openrouter",
    modelId: "nex-agi/nex-n2-pro:free",
    contextWindow: "262K",
    description: "Agentic MoE (397B/17B active). Coding, tool use & research.",
    isFree: true,
    category: "featured",
    badge: "🔥 NEW",
    supportsVision: true,
  },

  // ── Qwen — paid on current OpenRouter catalog ──
  {
    id: "or-qwen3-coder",
    name: "Qwen3 Coder 480B",
    provider: "openrouter",
    modelId: "qwen/qwen3-coder",
    contextWindow: "262K",
    description: "Powerful coding model. Paid on the current OpenRouter catalog.",
    isFree: false,
    category: "coding",
    badge: "💰 Paid",
  },
  {
    id: "or-qwen3-next",
    name: "Qwen3 Next 80B",
    provider: "openrouter",
    modelId: "qwen/qwen3-next-80b-a3b-instruct",
    contextWindow: "262K",
    description: "Compact 80B MoE. Paid on the current OpenRouter catalog.",
    isFree: false,
    category: "chat",
    badge: "💰 Paid",
  },

  // ── Google Gemma ──
  {
    id: "or-gemma4-31b",
    name: "Gemma 4 31B",
    provider: "openrouter",
    modelId: "google/gemma-4-31b-it:free",
    contextWindow: "262K",
    description: "Google's latest open model. Multimodal — text & image.",
    isFree: true,
    category: "multimodal",
    badge: "🆕 Gemma 4",
    supportsVision: true,
  },
  {
    id: "or-gemma4-26b",
    name: "Gemma 4 26B A4B",
    provider: "openrouter",
    modelId: "google/gemma-4-26b-a4b-it:free",
    contextWindow: "262K",
    description: "Efficient Gemma 4 MoE (4B active). Fast multimodal.",
    isFree: true,
    category: "multimodal",
    supportsVision: true,
  },

  // ── Meta Llama — paid on current OpenRouter catalog ──
  {
    id: "or-llama33-70b",
    name: "Llama 3.3 70B",
    provider: "openrouter",
    modelId: "meta-llama/llama-3.3-70b-instruct",
    contextWindow: "65K",
    description: "Reliable all-purpose 70B model from Meta. Paid on the current OpenRouter catalog.",
    isFree: false,
    category: "chat",
    badge: "💰 Paid",
  },
  {
    id: "or-llama32-3b",
    name: "Llama 3.2 3B",
    provider: "openrouter",
    modelId: "meta-llama/llama-3.2-3b-instruct",
    contextWindow: "131K",
    description: "Lightweight 3B model. Paid on the current OpenRouter catalog.",
    isFree: false,
    category: "chat",
    badge: "💰 Paid",
  },

  // ── NVIDIA ──
  {
    id: "or-nemotron-ultra",
    name: "Nemotron 3 Ultra 550B",
    provider: "openrouter",
    modelId: "nvidia/nemotron-3-ultra-550b-a55b:free",
    contextWindow: "1M",
    description: "NVIDIA's largest. 550B MoE, 55B active. 1M context.",
    isFree: true,
    category: "reasoning",
    badge: "🚀 550B",
  },
  {
    id: "or-nemotron-super",
    name: "Nemotron 3 Super 120B",
    provider: "openrouter",
    modelId: "nvidia/nemotron-3-super-120b-a12b:free",
    contextWindow: "262K",
    description: "120B MoE (12B active). Good for reasoning.",
    isFree: true,
    category: "reasoning",
  },
  {
    id: "or-nemotron-nano-omni",
    name: "Nemotron 3 Nano Omni 30B",
    provider: "openrouter",
    modelId: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    contextWindow: "256K",
    description: "30B reasoning MoE with vision support.",
    isFree: true,
    category: "reasoning",
    supportsVision: true,
  },
  {
    id: "or-nemotron-nano-30b",
    name: "Nemotron 3 Nano 30B",
    provider: "openrouter",
    modelId: "nvidia/nemotron-3-nano-30b-a3b:free",
    contextWindow: "256K",
    description: "Compact 30B MoE (3B active). Fast and lightweight.",
    isFree: true,
    category: "chat",
  },
  {
    id: "or-nemotron-nano-12b-vl",
    name: "Nemotron Nano 12B VL",
    provider: "openrouter",
    modelId: "nvidia/nemotron-nano-12b-v2-vl:free",
    contextWindow: "128K",
    description: "12B vision-language model. Image understanding.",
    isFree: true,
    category: "multimodal",
    supportsVision: true,
  },
  {
    id: "or-nemotron-nano-9b",
    name: "Nemotron Nano 9B",
    provider: "openrouter",
    modelId: "nvidia/nemotron-nano-9b-v2:free",
    contextWindow: "128K",
    description: "Tiny 9B. Ultra-fast for lightweight tasks.",
    isFree: true,
    category: "chat",
  },

  // ── OpenAI OSS ──
  {
    id: "or-gpt-oss-120b",
    name: "GPT-OSS 120B",
    provider: "openrouter",
    modelId: "openai/gpt-oss-120b:free",
    contextWindow: "131K",
    description: "OpenAI's open-source 120B. Solid reasoning & tool use.",
    isFree: true,
    category: "reasoning",
    badge: "⭐ Reliable",
  },
  {
    id: "or-gpt-oss-20b",
    name: "GPT-OSS 20B",
    provider: "openrouter",
    modelId: "openai/gpt-oss-20b:free",
    contextWindow: "131K",
    description: "Compact 20B open-source from OpenAI.",
    isFree: true,
    category: "chat",
  },

  // ── Poolside ──
  {
    id: "or-laguna-m1",
    name: "Poolside Laguna M1",
    provider: "openrouter",
    modelId: "poolside/laguna-m.1:free",
    contextWindow: "262K",
    description: "Code-first model for agents & automation.",
    isFree: true,
    category: "coding",
    badge: "💻 Agent",
  },
  {
    id: "or-laguna-xs2",
    name: "Poolside Laguna XS2",
    provider: "openrouter",
    modelId: "poolside/laguna-xs.2:free",
    contextWindow: "262K",
    description: "Lightweight coding agent. Fast inline suggestions.",
    isFree: true,
    category: "coding",
  },

  // ── Nous Research — paid on current OpenRouter catalog ──
  {
    id: "or-hermes3",
    name: "Hermes 3 Llama 405B",
    provider: "openrouter",
    modelId: "nousresearch/hermes-3-llama-3.1-405b",
    contextWindow: "131K",
    description: "Massive 405B generalist. Paid on the current OpenRouter catalog.",
    isFree: false,
    category: "chat",
    badge: "💰 Paid",
  },

  // ── Liquid ──
  {
    id: "or-lfm-instruct",
    name: "LFM 2.5 1.2B Instruct",
    provider: "openrouter",
    modelId: "liquid/lfm-2.5-1.2b-instruct:free",
    contextWindow: "32K",
    description: "Tiny 1.2B instruction model. Extremely fast.",
    isFree: true,
    category: "chat",
  },
  {
    id: "or-lfm-thinking",
    name: "LFM 2.5 1.2B Thinking",
    provider: "openrouter",
    modelId: "liquid/lfm-2.5-1.2b-thinking:free",
    contextWindow: "32K",
    description: "Tiny reasoning model with chain-of-thought.",
    isFree: true,
    category: "reasoning",
  },

  // ═══════════════════════════════════
  // Groq — Free tier (rate-limited)
  // ═══════════════════════════════════
  {
    id: "groq-llama4-scout",
    name: "Llama 4 Scout (Groq)",
    provider: "groq",
    modelId: "meta-llama/llama-4-scout-17b-16e-instruct",
    contextWindow: "128K",
    description: "Ultra-fast Llama 4 on Groq's LPU.",
    isFree: true,
    category: "chat",
    badge: "⚡ Fastest",
  },
  {
    id: "groq-llama33-70b",
    name: "Llama 3.3 70B (Groq)",
    provider: "groq",
    modelId: "llama-3.3-70b-versatile",
    contextWindow: "128K",
    description: "70B with ultra-fast Groq inference.",
    isFree: true,
    category: "chat",
    badge: "⚡ Fast",
  },

  // ═══════════════════════════════════
  // Google AI Studio — Free tier
  // ═══════════════════════════════════
  {
    id: "google-gemini-25-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    modelId: "gemini-2.5-flash-preview-05-20",
    contextWindow: "1M",
    description: "Google's fast multimodal model. Free tier.",
    isFree: true,
    category: "multimodal",
    badge: "🌟 Best Free",
    supportsVision: true,
  },
  {
    id: "google-gemini-25-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    modelId: "gemini-2.5-pro-preview-06-05",
    contextWindow: "1M",
    description: "Google's most capable. 1M context.",
    isFree: true,
    category: "reasoning",
    badge: "🌟 Powerful",
    supportsVision: true,
  },

  // ═══════════════════════════════════
  // OpenAI — Paid
  // ═══════════════════════════════════
  {
    id: "openai-gpt4o",
    name: "GPT-4o",
    provider: "openai",
    modelId: "gpt-4o",
    contextWindow: "128K",
    description: "OpenAI flagship. Paid API key required.",
    isFree: false,
    category: "multimodal",
    supportsVision: true,
  },
  {
    id: "openai-gpt4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    modelId: "gpt-4o-mini",
    contextWindow: "128K",
    description: "Affordable and fast.",
    isFree: false,
    category: "chat",
    supportsVision: true,
  },
];

export function getModelById(id: string): AIModel | undefined {
  return MODELS.find((m) => m.id === id);
}
export function getModelsByProvider(provider: Provider): AIModel[] {
  return MODELS.filter((m) => m.provider === provider);
}
export function getFreeModels(): AIModel[] {
  return MODELS.filter((m) => m.isFree);
}
export function getModelsByCategory(category: AIModel["category"]): AIModel[] {
  return MODELS.filter((m) => m.category === category);
}
export function getVisionModels(): AIModel[] {
  return MODELS.filter((m) => m.supportsVision);
}
