import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export async function POST(req: NextRequest) {
  try {
    const { query, apiKey } = await req.json();

    if (!query || typeof query !== "string") {
      return Response.json({ error: "Query is required" }, { status: 400 });
    }

    // If user has a Tavily key, use Tavily for best results
    if (apiKey) {
      return tavilySearch(query, apiKey);
    }

    // Otherwise use DuckDuckGo HTML search as a free fallback
    return duckDuckGoSearch(query);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

async function tavilySearch(query: string, apiKey: string) {
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

  if (!res.ok) {
    const error = await res.text();
    return Response.json({ error: `Tavily error: ${error}` }, { status: res.status });
  }

  const data = await res.json();
  const results: SearchResult[] = (data.results || []).map(
    (r: { title: string; url: string; content: string }) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
    })
  );

  return Response.json({ results });
}

async function duckDuckGoSearch(query: string): Promise<Response> {
  try {
    // Use DuckDuckGo HTML lite endpoint and parse results
    const encoded = encodeURIComponent(query);
    const url = `https://html.duckduckgo.com/html/?q=${encoded}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      return Response.json({ results: [], fallback: true });
    }

    const html = await res.text();
    const results = parseDDGResults(html);
    return Response.json({ results });
  } catch {
    return Response.json({ results: [], fallback: true });
  }
}

function parseDDGResults(html: string): SearchResult[] {
  const results: SearchResult[] = [];

  // Match each result block
  const resultBlocks = html.split(/class="result results_links/);

  for (let i = 1; i < resultBlocks.length && results.length < 6; i++) {
    const block = resultBlocks[i];

    // Extract URL from the <a> tag with class "result__a"
    const urlMatch = block.match(/class="result__a"[^>]*href="([^"]+)"/);
    let url = "";
    if (urlMatch) {
      url = urlMatch[1];
      // DuckDuckGo wraps URLs in a redirect, extract the actual URL
      const uddgMatch = url.match(/uddg=([^&]+)/);
      if (uddgMatch) {
        url = decodeURIComponent(uddgMatch[1]);
      }
    }

    // Extract title text
    const titleMatch = block.match(/class="result__a"[^>]*>([^<]+)</);
    const title = titleMatch ? decodeHTMLEntities(titleMatch[1].trim()) : "";

    // Extract snippet
    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
    let snippet = "";
    if (snippetMatch) {
      snippet = decodeHTMLEntities(
        snippetMatch[1].replace(/<[^>]*>/g, "").trim()
      );
    }

    if (title && url && !url.includes("duckduckgo.com")) {
      results.push({ title, url, snippet });
    }
  }

  return results;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}
