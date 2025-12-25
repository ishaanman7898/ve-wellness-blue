import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "..");
const kbPath = path.join(repoRoot, "chatbot-backend", "knowledge_base.json");
const outPath = path.join(repoRoot, "public", "rag_index.json");

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

async function cfEmbed(text) {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  const model = process.env.CF_EMBED_MODEL || "@cf/baai/bge-small-en-v1.5";

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
    const t = await resp.text();
    throw new Error(`Workers AI embeddings error ${resp.status}: ${t}`);
  }

  const data = await resp.json();
  const v =
    data?.result?.data?.[0] ||
    data?.result?.data ||
    data?.result?.embedding ||
    data?.embedding ||
    null;
  if (!Array.isArray(v)) return null;

  let sum = 0;
  for (const x of v) sum += x * x;
  const denom = Math.sqrt(sum) || 1;
  return v.map((x) => x / denom);
}

async function loadActiveProducts() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) {
    throw error;
  }

  const active = (data || []).filter(
    (p) => p.status !== "Phased Out" && p.status !== "Removal Requested" && p.status !== "Removal Pending"
  );

  return active;
}

async function main() {
  const pages = JSON.parse(fs.readFileSync(kbPath, "utf-8"));
  const activeProducts = await loadActiveProducts();

  const siteUrl = process.env.PUBLIC_SITE_URL || "http://localhost:8080";
  const normalizedSiteUrl = siteUrl.replace(/\/$/, "");

  const baseChunks = pages.map((page) => ({
    title: page.title,
    url: page.url,
    content: page.content,
    embedding: [],
  }));

  const productChunks = activeProducts.map((p) => {
    const group = p.group_name || p.name;
    const url = `${normalizedSiteUrl}/product/${slugify(group)}?sku=${encodeURIComponent(p.sku)}`;
    const title = `${group} - ${p.name}`;
    const content = `${p.name} (SKU: ${p.sku}) Price: $${Number(p.price).toFixed(2)}. ${p.description || ""}`.trim();
    return { title, url, content, embedding: [] };
  });

  const surgeVariants = activeProducts.filter((p) => (p.group_name || "").toLowerCase() === "surge iv");
  const surgeFlavors = surgeVariants
    .map((p) => p.color || p.name)
    .filter(Boolean)
    .map((x) => String(x).trim())
    .filter(Boolean);
  const uniqueSurgeFlavors = Array.from(new Set(surgeFlavors));

  const surgeSummary = {
    title: "Surge IV Electrolytes - Available Flavors",
    url: `${normalizedSiteUrl}/shop/supplements`,
    content: uniqueSurgeFlavors.length
      ? `Surge IV is currently available in ${uniqueSurgeFlavors.length} flavors: ${uniqueSurgeFlavors.join(", ")}. This list reflects the live supplements page and excludes phased-out variants.`
      : "Surge IV flavor availability should match the live supplements page and excludes phased-out variants.",
    embedding: [],
  };

  const chunks = [...baseChunks, surgeSummary, ...productChunks];

  let existingIndex = null;
  if (process.env.FORCE_RAG_REBUILD !== "1" && fs.existsSync(outPath)) {
    try {
      existingIndex = JSON.parse(fs.readFileSync(outPath, "utf-8"));
    } catch {
      existingIndex = null;
    }
  }

  const existingEmbeddings = new Map();
  const existingChunks = Array.isArray(existingIndex?.chunks) ? existingIndex.chunks : [];
  for (const c of existingChunks) {
    const key = `${c?.title || ""}||${c?.url || ""}||${c?.content || ""}`;
    if (Array.isArray(c?.embedding) && c.embedding.length > 0) {
      existingEmbeddings.set(key, c.embedding);
    }
  }

  const rewritten = chunks.map((c) => {
    const fixedUrl = c.url.startsWith("http://localhost:8080")
      ? normalizedSiteUrl + c.url.slice("http://localhost:8080".length)
      : c.url;
    return { ...c, url: fixedUrl };
  });

  const withEmbeddings = [];
  for (const c of rewritten) {
    const cacheKey = `${c.title}||${c.url}||${c.content}`;
    const cached = existingEmbeddings.get(cacheKey);
    if (cached) {
      withEmbeddings.push({ ...c, embedding: cached });
      continue;
    }

    const text = `Title: ${c.title}\nURL: ${c.url}\n\n${c.content}`;
    let embedding = [];
    try {
      const v = await cfEmbed(text);
      if (v) embedding = v;
    } catch {
      embedding = [];
    }
    withEmbeddings.push({ ...c, embedding });
  }

  fs.writeFileSync(outPath, JSON.stringify({ chunks: withEmbeddings }, null, 2));
  process.stdout.write(`Wrote ${withEmbeddings.length} embeddings to ${outPath}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
