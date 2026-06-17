import type { SearchResult } from "./types";

/**
 * Searches via our /api/search proxy first (works on Vercel / dev server).
 * If the route is unreachable (e.g. GitHub Pages static export), falls back
 * to calling Tavily directly from the client when a key is provided.
 */
export async function searchWeb(
  query: string,
  tavilyKey: string
): Promise<SearchResult[]> {
  // 1. Try the server-side proxy (free, no key needed)
  try {
    const res = await fetch("/api/search/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, apiKey: tavilyKey || undefined }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results;
      }
    }
  } catch {
    // Route unavailable (static export), try client-side fallback
  }

  // 2. Client-side fallback – Tavily direct (requires key)
  if (tavilyKey) {
    return tavilySearchDirect(query, tavilyKey);
  }

  return [];
}

async function tavilySearchDirect(
  query: string,
  apiKey: string
): Promise<SearchResult[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: 5,
      include_answer: false,
      include_raw_content: false,
      search_depth: "basic",
    }),
  });

  if (!res.ok) return [];

  const data = await res.json();
  return (data.results || []).map(
    (r: { title: string; url: string; content: string }) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
    })
  );
}

export function formatSearchResultsForContext(results: SearchResult[]): string {
  if (results.length === 0) return "";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let context = `\n\n[SEARCH CONTEXT — retrieved ${today}]\n`;
  context += `The following are real-time web search results for the user's query.\n\n`;

  results.forEach((result, index) => {
    context += `[${index + 1}] "${result.title}"\n`;
    context += `${result.snippet}\n`;
    context += `Source: ${result.url}\n\n`;
  });

  context += `[END SEARCH CONTEXT]\n`;
  context += `Instructions: Use the search results above as the source of truth for current facts. Do not rely on older training data when the search context is relevant. Cite sources with [1], [2], etc. If results conflict, mention uncertainty and prefer newer/reputable sources.\n\n`;

  return context;
}

export function shouldSearch(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Strong signals — always search
  const strongKeywords = [
    "latest",
    "recent",
    "current",
    "today",
    "yesterday",
    "this week",
    "this month",
    "right now",
    "2024",
    "2025",
    "2026",
    "news",
    "update",
    "happening",
    "breaking",
    "announced",
    "launched",
    "released",
    "trending",
    "price of",
    "stock price",
    "weather",
    "score",
    "who won",
    "who is the current",
    "election",
    "what happened",
    "search for",
    "look up",
    "find out",
    "search the web",
    "google",
  ];

  if (strongKeywords.some((kw) => lowerMessage.includes(kw))) {
    return true;
  }

  // Question patterns that often need current info
  const questionPatterns = [
    /^(what|who|where|when|how|is|are|did|does|will|can)\s/,
  ];

  // Only for question-pattern + weaker signals
  if (questionPatterns.some((p) => p.test(lowerMessage))) {
    const weakKeywords = [
      "best",
      "top",
      "compare",
      "vs",
      "review",
      "specs",
      "features",
      "release date",
      "when will",
      "when is",
      "how much",
      "salary",
      "population",
    ];
    if (weakKeywords.some((kw) => lowerMessage.includes(kw))) {
      return true;
    }
  }

  return false;
}
