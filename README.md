# ⚡ NexChat AI — Free Multi-Model Chatbot

A stunning, production-ready chatbot web application with **file/image uploads**, **real-time web search**, and support for 20+ free AI models including OpenRouter's latest **Owl Alpha** and **Nex-N2 Pro**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🤖 AI Models
- 🔥 **20+ Free AI Models** — DeepSeek R1, Llama 4, Qwen3, Owl Alpha, Nex-N2 Pro, and more
- 🌐 **Multi-Provider Support** — OpenRouter, Groq, Google AI Studio, OpenAI, and custom endpoints
- 🔐 **Bring Your Own Key** — API keys stored locally in browser, never sent to servers

### 📎 File & Image Upload
- 🖼️ **Image Analysis** — Upload images for vision-capable models (Llama 4 Maverick, Gemini, GPT-4o)
- 📄 **File Support** — TXT, Markdown, JSON, CSV, PDF, HTML, CSS, JS files
- 👁️ **Preview** — See attached files and images before sending
- 📏 **10MB limit** per file

### 🔍 Real-Time Web Search
- 🌐 **Live Search** — AI models can access current information from the web
- 🤖 **Auto-Detection** — Automatically searches when queries need current info
- 🔘 **Manual Toggle** — Click search icon to force search for any message
- 📚 **Source Citations** — Search results shown with clickable source links
- ⚡ **Powered by Tavily** — Free API with 1,000 searches/month

### 💬 Chat Experience
- 💬 **Real-time Streaming** — Watch AI responses appear in real-time
- 📝 **Markdown Rendering** — Code blocks, tables, lists, and rich formatting
- 📚 **Chat History** — Conversations saved to browser localStorage
- 🎨 **Beautiful Dark UI** — Modern glassmorphism design with smooth animations
- 📱 **Fully Responsive** — Works perfectly on desktop, tablet, and mobile

### ⚙️ Customization
- 🌡️ **Temperature Control** — Adjust creativity vs precision
- 📊 **Max Tokens** — Control response length
- 💬 **System Prompts** — Customize AI personality and behavior
- 🚀 **Deploy Anywhere** — GitHub Pages, Vercel, Netlify, or any static host

---

## 🚀 Quick Start

### 1. Get Free API Keys

| Service | Free Tier | Get Key |
|---------|-----------|---------|
| **OpenRouter** | 20+ free models | [openrouter.ai/keys](https://openrouter.ai/keys) |
| **Groq** | Ultra-fast inference | [console.groq.com](https://console.groq.com) |
| **Google AI** | Gemini 2.5 (1M context) | [aistudio.google.com](https://aistudio.google.com) |
| **Tavily** | 1,000 searches/month | [tavily.com](https://tavily.com) |

### 2. Deploy

#### GitHub Pages (Free Hosting)
```bash
# Push to GitHub, then:
# Settings → Pages → GitHub Actions
# Auto-deploys to: https://username.github.io/repo-name/
```

#### Vercel (One-Click)
```bash
# Push to GitHub, import at vercel.com/new, deploy!
```

#### Local Development
```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## 🆓 Free Models

### OpenRouter Free Tier
| Model | Best For | Context | Vision |
|-------|----------|---------|--------|
| 🔥 **Owl Alpha** | Coding, math, agentic | 1M | ✅ |
| 🔥 **Nex-N2 Pro** | Coding, tool use, research | 262K | ✅ |
| ⭐ **DeepSeek R1** | Reasoning, math, logic | 64K | ❌ |
| 💻 **Qwen3 235B** | Coding, analysis | 128K | ❌ |
| 💻 **Qwen3 Coder** | Specialized coding | 128K | ❌ |
| 🎨 **Llama 4 Maverick** | Multimodal, long context | 1M | ✅ |
| ⚡ **Llama 4 Scout** | Fast real-time chat | 128K | ❌ |
| 🧠 **Grok 3 Mini** | Lightweight reasoning | 131K | ❌ |
| 💬 **Gemma 3 27B** | Summaries, instructions | 128K | ❌ |
| 💬 **Mistral Small 3.1** | Writing, coding | 128K | ❌ |
| 🧠 **Nemotron 3 Super** | High-context tasks | 128K | ❌ |

### Groq (Ultra-Fast)
| Model | Context | Speed |
|-------|---------|-------|
| **Llama 4 Scout** | 128K | ⚡⚡⚡ |
| **Llama 3.3 70B** | 128K | ⚡⚡⚡ |
| **Qwen3 32B** | 128K | ⚡⚡⚡ |

### Google AI Studio
| Model | Context | Vision |
|-------|---------|--------|
| **Gemini 2.5 Flash** | 1M | ✅ |
| **Gemini 2.5 Pro** | 1M | ✅ |

---

## 📎 Supported File Types

### Images (Vision Models Only)
- JPEG, PNG, GIF, WebP

### Documents
- **Text**: TXT, Markdown, CSV
- **Code**: JSON, HTML, CSS, JavaScript
- **Documents**: PDF (text extraction)

---

## 🔍 Web Search Setup

1. Get a free API key at [tavily.com](https://tavily.com)
2. Open Settings → Web Search tab
3. Paste your Tavily API key
4. Enable "Web Search" toggle

### Auto-Search Detection
When enabled, NexChat automatically searches for queries containing:
- Time-sensitive terms: "latest", "current", "today", "2024", "2025", "2026"
- News/updates: "news", "announced", "released", "trending"
- Prices/stats: "price of", "stock", "weather", "score"
- Comparisons: "best", "top", "compare", "vs", "review"

### Manual Search
Click the 🔍 button next to the input to force a web search for any message.

---

## 🛠 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for server deployment (Vercel)
npm run build

# Build for static export (GitHub Pages)
STATIC_EXPORT=true npm run build

# Preview static build
npx serve out
```

---

## 🏗 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4
- **Storage**: Browser localStorage
- **Search**: Tavily API
- **Streaming**: Native Fetch + SSE
- **Markdown**: react-markdown

---

## 📁 Project Structure

```
├── .github/workflows/deploy.yml  # GitHub Pages auto-deploy
├── src/
│   ├── app/
│   │   ├── globals.css          # Tailwind + custom styles
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── not-found.tsx        # 404 page
│   ├── components/
│   │   ├── ChatApp.tsx          # Main chat application
│   │   ├── ChatMessage.tsx      # Message bubble
│   │   ├── ModelSelector.tsx    # Model dropdown
│   │   ├── SettingsModal.tsx    # Settings dialog
│   │   ├── Sidebar.tsx          # Conversation list
│   │   ├── AttachmentPreview.tsx # File preview
│   │   └── SearchResults.tsx    # Web search display
│   └── lib/
│       ├── models.ts            # AI model definitions
│       ├── types.ts             # TypeScript types
│       ├── files.ts             # File processing
│       └── search.ts            # Web search
├── next.config.ts               # Next.js config
└── README.md
```

---

## 🔒 Privacy & Security

- ✅ API keys stored **only** in browser localStorage
- ✅ Keys sent **directly** to AI providers (OpenRouter, Groq, etc.)
- ✅ **Zero server-side storage** — fully client-side app
- ✅ Chat history stored locally in your browser
- ✅ Search queries go directly to Tavily
- ✅ No tracking, no analytics

---

## 📄 License

MIT — Use freely for personal and commercial projects.

---

**Made with ⚡ by NexChat AI**
