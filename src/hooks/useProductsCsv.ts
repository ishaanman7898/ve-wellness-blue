import { useEffect, useState, useMemo } from "react";
import type { Product } from "@/data/products";

interface UseProductsCsvResult {
  products: Product[];
  loading: boolean;
  error: string | null;
}

// Lightweight CSV parser that supports quoted fields with commas
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === "\"") {
        if (text[i + 1] === "\"") {
          field += "\"";
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === "\"") {
        inQuotes = true;
      } else if (ch === ",") {
        cur.push(field);
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        cur.push(field);
        field = "";
        if (cur.length > 1 || cur[0] !== "") rows.push(cur);
        cur = [];
      } else {
        field += ch;
      }
    }
  }

  if (field.length || cur.length) {
    cur.push(field);
    rows.push(cur);
  }

  return rows;
}

function normalizeCategory(categoryRaw: string): string {
  const c = categoryRaw.trim();
  if (!c) return "Other";
  if (/^water bottle/i.test(c)) return "Water Bottles";
  if (/^bundle/i.test(c)) return "Bundles";
  if (/^electrolyte/i.test(c)) return "Wellness";
  if (/^lid/i.test(c)) return "Accessories";
  if (/^supplement/i.test(c)) return "Wellness";
  if (/^seasonal/i.test(c)) return "Wellness";
  if (/^subscription/i.test(c)) return "Subscriptions";
  if (/^accessor/i.test(c)) return "Accessories";
  return c;
}

function buildGroupName(name: string): string {
  const base = name.split(" (")[0].trim();
  if (/^surge iv/i.test(base)) return "Surge IV";
  if (/^the glacier/i.test(base)) return "The Glacier";
  if (/^the iceberg/i.test(base)) return "The Iceberg";
  if (/^peak powder/i.test(base) || /^peak protein/i.test(base)) return "Peak Protein";
  return base;
}

function extractColor(name: string): string | undefined {
  const match = name.match(/\(([^)]+)\)/);
  return match?.[1]?.trim() || undefined;
}

const hexColorLookup: Record<string, string> = {
  "The Glacier|Black": "#111827",
  "The Glacier|Brown": "#7b3f00",
  "The Glacier|Frost Blue": "#60a5fa",
  "The Glacier|Maroon": "#7f1d1d",
  "The Glacier|Orange": "#f97316",
  "The Glacier|White": "#ffffff",
  "The Glacier|Santa Sleigh": "#b91c1c",
  "The Glacier|Rudolph Red": "#b91c1c",
  "The Glacier|Iced Cookie": "#fde68a",
  "The Glacier|Christmas Tree": "#15803d",
  "The Iceberg|Black": "#111827",
  "The Iceberg|Brown": "#7b3f00",
  "The Iceberg|Frost Blue": "#60a5fa",
  "The Iceberg|Maroon": "#7f1d1d",
  "The Iceberg|Orange": "#f97316",
  "The Iceberg|White": "#ffffff",
  "The Iceberg|Rudolph Red": "#b91c1c",
  "The Iceberg|Santa's Sleigh": "#b91c1c",
  "The Iceberg|Santa Sleigh": "#b91c1c",
  "The Iceberg|Iced Cookie": "#fde68a",
  "Surge IV|Blue Razzberry": "#3b82f6",
  "Surge IV|Fruit Punch": "#ef4444",
  "Surge IV|Lemonade": "#facc15",
  "Surge IV|Pina Colada": "#fbbf24",
  "Surge IV|Strawberry": "#fb7185",
  "Surge IV|Tropical Vibes": "#f97316",
  "Surge IV|Cucumber Lime": "#22c55e",
  "Surge IV|Apple Cider": "#92400e",
  "Peak Protein|Pumpkin Spice": "#d97706",
  "Peak Protein|Gingerbread": "#92400e",
  "Peak Protein|Marshmallow": "#e5e7eb",
  "Peak Protein|Chocolate": "#3f2a1d",
  "Peak Protein|Vanilla": "#f5e9c8",
};

function getHexColor(groupName: string, color?: string): string | undefined {
  if (!color) return undefined;
  const key = `${groupName}|${color}`;
  return hexColorLookup[key];
}

async function fetchFirstAvailable(paths: string[]): Promise<string> {
  let lastError: any = null;
  for (const path of paths) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }
      return await res.text();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError ?? new Error("Failed to load CSV");
}

export function useProductsCsv(): UseProductsCsvResult {
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const text = await fetchFirstAvailable([
          "/products.csv",
          "/Products w_ Prices - Products with Prices - Main.csv",
        ]);
        if (cancelled) return;
        const rows = parseCSV(text);
        setRawRows(rows);
        setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Failed to load products");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const products = useMemo<Product[]>(() => {
    if (!rawRows.length) return [];
    const header = rawRows[0];

    const idx = (labelRegex: RegExp) =>
      header.findIndex((h) => labelRegex.test(h.trim().toLowerCase()));

    const categoryIdx = idx(/category/);
    const nameIdx = idx(/product name/);
    const statusIdx = idx(/status/);
    const skuIdx = idx(/sku/);
    const finalPriceIdx = idx(/final price/);
    const buyLinkIdx = idx(/buy button links?/);

    const result: Product[] = [];

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rawName = (row[nameIdx] || "").trim();
      const sku = (row[skuIdx] || "").trim();
      if (!rawName || !sku) continue;

      const categoryRaw = row[categoryIdx] || "";
      const category = normalizeCategory(categoryRaw);
      const name = rawName;
      const status = (row[statusIdx] || "").trim();
      const priceStr = (row[finalPriceIdx] || "0").toString();
      const price = Number(priceStr.replace(/[$,]/g, "")) || 0;
      const buyLink = (row[buyLinkIdx] || "").trim();

      const groupName = buildGroupName(name);
      const color = extractColor(name);
      const hexColor = getHexColor(groupName, color);

      const id = sku.toLowerCase();
      const image = `/product-images/${sku}.png`;

      const product: Product = {
        id,
        category,
        name,
        status,
        sku,
        price,
        buyLink,
        image,
        groupName,
        color,
        hexColor,
      };

      result.push(product);
    }

    return result;
  }, [rawRows]);

  return { products, loading, error };
}
