type RagChunk = {
  title: string;
  url: string;
  content: string;
  embedding: number[];
};

type RagIndex = {
  chunks: RagChunk[];
};

type ChatRequest = {
  message: string;
  conversation_history?: Array<{ role: "user" | "assistant"; content: string }>;
};

type PagesFunctionContext = {
  request: Request;
  env: Record<string, any>;
};

type PagesFunction = (context: PagesFunctionContext) => Promise<Response>;

function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function cosineSim(a: number[], b: number[]) {
  return dot(a, b);
}

function l2Normalize(vec: number[]) {
  let sum = 0;
  for (const v of vec) sum += v * v;
  const denom = Math.sqrt(sum) || 1;
  return vec.map((v) => v / denom);
}

function normalizeQuery(q: string) {
  return (q || "").trim().replace(/\s+/g, " ");
}

function keywordFallbackScore(q: string, text: string) {
  const words = q
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);
  const t = text.toLowerCase();
  let score = 0;
  for (const w of words) {
    if (t.includes(w)) score += 1;
  }
  return score;
}

function isActiveProductStatus(status: string | null | undefined) {
  return status !== "Phased Out" && status !== "Removal Requested" && status !== "Removal Pending";
}

// Cache for Supabase products (in-memory, per worker instance)
// This cache persists across requests within the same worker instance
// Cloudflare Workers are stateless but instances can handle multiple requests
let productsCache: any[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchSupabaseProducts(env: any): Promise<any[]> {
  // Check cache first - this prevents unnecessary Supabase calls
  // and doesn't count as a "build" - it's runtime caching
  const now = Date.now();
  if (productsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return productsCache;
  }
  
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return [];

  const url = `${String(supabaseUrl).replace(/\/$/, "")}/rest/v1/products?select=*&order=created_at.desc`;
  const resp = await fetch(url, {
    headers: {
      apikey: String(supabaseAnonKey),
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });
  if (!resp.ok) return productsCache || []; // Return cached data on error
  
  const data = (await resp.json()) as any[];
  const products = Array.isArray(data) ? data : [];
  
  // Update cache - this is in-memory, not a build artifact
  productsCache = products;
  cacheTimestamp = now;
  
  return products;
}

function toProductChunk(p: any, siteUrl: string): RagChunk {
  const group = p.group_name || p.name;
  const slug = String(group || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const productUrl = `${siteUrl.replace(/\/$/, "")}/product/${slug}?sku=${encodeURIComponent(p.sku || "")}`;
  const specs = p.specifications ? JSON.stringify(p.specifications) : "";
  const content = [
    `Name: ${p.name}`,
    p.group_name ? `Group: ${p.group_name}` : "",
    p.sku ? `SKU: ${p.sku}` : "",
    p.category ? `Category: ${p.category}` : "",
    p.status ? `Status: ${p.status}` : "",
    p.price != null ? `Price: $${Number(p.price).toFixed(2)}` : "",
    p.description ? `Description: ${p.description}` : "",
    specs ? `Specifications: ${specs}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    title: `${String(group || "Product")} - ${String(p.name || "")}`,
    url: productUrl,
    content,
    embedding: [],
  };
}

async function loadIndex(env: any): Promise<RagIndex> {
  const res = await env.ASSETS.fetch("http://internal/rag_index.json");
  if (!res.ok) {
    throw new Error(`Failed to load rag_index.json (${res.status})`);
  }
  return (await res.json()) as RagIndex;
}

async function callWorkersAI(env: any, prompt: string): Promise<string> {
  const accountId = env.CF_ACCOUNT_ID;
  const apiToken = env.CF_API_TOKEN;
  const model = env.CF_AI_MODEL || "@cf/meta/llama-3.1-8b-instruct";

  if (!accountId || !apiToken) {
    throw new Error("Missing CF_ACCOUNT_ID/CF_API_TOKEN");
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Workers AI error ${resp.status}: ${txt}`);
  }

  const data: any = await resp.json();
  return data?.result?.response ?? data?.response ?? "";
}

async function embedQuery(env: any, text: string): Promise<number[] | null> {
  const accountId = env.CF_ACCOUNT_ID;
  const apiToken = env.CF_API_TOKEN;
  const model = env.CF_EMBED_MODEL || "@cf/baai/bge-small-en-v1.5";

  if (!accountId || !apiToken) {
    return null;
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!resp.ok) {
    return null;
  }

  const data: any = await resp.json();
  const v =
    data?.result?.data?.[0] ||
    data?.result?.data ||
    data?.result?.embedding ||
    data?.embedding ||
    null;
  if (!Array.isArray(v)) return null;
  return l2Normalize(v);
}

export const onRequestPost: PagesFunction = async ({ request, env }: PagesFunctionContext) => {
  const body = (await request.json()) as ChatRequest;
  const q = normalizeQuery(body.message);

  const index = await loadIndex(env);

  const siteUrl = String(env.PUBLIC_SITE_URL || "http://localhost:8080");
  const supaAll = await fetchSupabaseProducts(env);
  const supaActive = supaAll.filter((p) => isActiveProductStatus(p?.status));

  const dynamicChunks: RagChunk[] = [];

  if (supaActive.length > 0) {
    // Add explicit price summary for questions like "most expensive product".
    const sortedByPrice = [...supaActive]
      .filter((p) => typeof p.price === "number")
      .sort((a, b) => Number(b.price) - Number(a.price));
    const mostExpensive = sortedByPrice[0];
    if (mostExpensive) {
      dynamicChunks.push({
        title: "Pricing Summary - Most Expensive Product",
        url: `${siteUrl.replace(/\/$/, "")}/shop`,
        content: `The most expensive active product is "${mostExpensive.name}" (${mostExpensive.group_name || ""}) at $${Number(mostExpensive.price).toFixed(2)}.`,
        embedding: [],
      });
    }

    // Help with bundle comparisons.
    const bundles = supaActive.filter((p) => String(p.category || "").toLowerCase() === "bundles");
    if (bundles.length) {
      const lines = bundles
        .slice(0, 20)
        .map((b) => `- ${b.name} ($${Number(b.price).toFixed(2)})${b.description ? `: ${b.description}` : ""}`)
        .join("\n");
      dynamicChunks.push({
        title: "Bundles - Current Active Bundles",
        url: `${siteUrl.replace(/\/$/, "")}/shop/bundles`,
        content: `Active bundles:\n${lines}`,
        embedding: [],
      });
    }

    // Include product-specific chunks (name/price/specs) for accurate Q&A.
    // Limit to reduce per-request overhead.
    for (const p of supaActive.slice(0, 80)) {
      dynamicChunks.push(toProductChunk(p, siteUrl));
    }
  }

  const allChunks = [...dynamicChunks, ...index.chunks];

  const qEmbed = await embedQuery(env, q);
  const hasEmbeddings = Boolean(qEmbed) && allChunks.some((c) => Array.isArray(c.embedding) && c.embedding.length > 0);

  const scored = allChunks
    .map((c) => {
      const kw = keywordFallbackScore(q, `${c.title}\n${c.content}`);
      if (hasEmbeddings && qEmbed && Array.isArray(c.embedding) && c.embedding.length > 0) {
        const sem = cosineSim(qEmbed, c.embedding);
        return { c, score: sem + kw * 0.05 };
      }
      return { c, score: kw };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored.slice(0, Number(env.RAG_TOP_K || 7)).map((x) => x.c);

  const context = top
    .map((c) => `Title: ${c.title}\nURL: ${c.url}\n\n${c.content}`)
    .join("\n\n---\n\n")
    .slice(0, Number(env.RAG_MAX_CONTEXT_CHARS || 3500));

  const prompt =
    "You are Thrive Wellness's helpful AI assistant. " +
    "Answer the user's question using ONLY the context below. " +
    "For product prices, use the exact prices from the context. " +
    "Be concise, friendly, and conversational - give direct answers without repeating the entire context. " +
    "If asking about the most expensive product, identify it clearly by name and price. " +
    "If asking about bundle contents, list what's included clearly. " +
    "If the answer isn't in the context, say you don't know." +
    "\n\n" +
    `Context:\n${context}\n\n` +
    `User question: ${q}\n\n` +
    "Answer (be direct and natural, don't dump raw context):";

  let responseText = "";
  try {
    responseText = await callWorkersAI(env, prompt);
  } catch (e) {
    responseText = `Based on our website information:\n\n${context}`;
  }

  const sources = top.slice(0, 3).map((c) => ({ content: c.content.slice(0, 200), url: c.url }));

  return new Response(JSON.stringify({ response: responseText, sources }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
