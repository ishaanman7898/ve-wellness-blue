/**
 * Development API server for chatbot
 * Simulates Cloudflare Worker locally
 */
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Load RAG index
let ragIndex = null;
try {
  const ragPath = path.join(__dirname, '../public/rag_index.json');
  ragIndex = JSON.parse(fs.readFileSync(ragPath, 'utf-8'));
  console.log(`✓ Loaded RAG index: ${ragIndex.chunks.length} chunks`);
} catch (err) {
  console.error('✗ Failed to load RAG index:', err.message);
}

// Cache for Supabase products
let productsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple keyword matching for development
function keywordScore(query, text) {
  const words = query.toLowerCase().split(/\W+/).filter(Boolean);
  const textLower = text.toLowerCase();
  let score = 0;
  for (const word of words) {
    if (textLower.includes(word)) score += 1;
  }
  return score;
}

// Fetch products from Supabase with caching
async function fetchSupabaseProducts() {
  // Check cache first
  const now = Date.now();
  if (productsCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log(`📦 Using cached products (${productsCache.length} items)`);
    return productsCache;
  }
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠ Supabase credentials not configured');
    return [];
  }
  
  try {
    const url = `${supabaseUrl}/rest/v1/products?select=*&order=created_at.desc`;
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }
    
    const products = await response.json();
    const activeProducts = products.filter(p => p.status !== 'Phased Out' && p.status !== 'Removal Requested');
    
    // Update cache
    productsCache = activeProducts;
    cacheTimestamp = now;
    console.log(`📦 Fetched ${activeProducts.length} products from Supabase (cached for 5 min)`);
    
    return activeProducts;
  } catch (err) {
    console.error('✗ Supabase fetch error:', err.message);
    // Return cached data if available, even if expired
    return productsCache || [];
  }
}

// Format product for context
function formatProduct(product, siteUrl) {
  const group = product.group_name || product.name;
  const slug = String(group || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const url = `${siteUrl}/product/${slug}?sku=${encodeURIComponent(product.sku || '')}`;
  
  const content = [
    `Name: ${product.name}`,
    product.group_name ? `Group: ${product.group_name}` : '',
    product.sku ? `SKU: ${product.sku}` : '',
    product.category ? `Category: ${product.category}` : '',
    product.price != null ? `Price: $${Number(product.price).toFixed(2)}` : '',
    product.description ? `Description: ${product.description}` : ''
  ].filter(Boolean).join('\n');
  
  return {
    title: `${group} - ${product.name}`,
    url,
    content
  };
}

// Call Cloudflare AI
async function callCloudflareAI(prompt) {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  const model = process.env.CF_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct';
  
  if (!accountId || !apiToken) {
    throw new Error('Cloudflare AI not configured');
  }
  
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudflare AI error ${response.status}: ${text}`);
  }
  
  const data = await response.json();
  return data?.result?.response || data?.response || '';
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const query = (message || '').trim();
    
    if (!query) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    if (!ragIndex) {
      return res.status(500).json({ error: 'RAG index not loaded' });
    }
    
    console.log(`\n📨 Query: ${query}`);
    
    // Fetch live products
    const products = await fetchSupabaseProducts();
    
    // Create dynamic chunks from products
    const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:8080';
    const dynamicChunks = products.slice(0, 50).map(p => formatProduct(p, siteUrl));
    
    // Add pricing summary
    if (products.length > 0) {
      const sortedByPrice = [...products]
        .filter(p => typeof p.price === 'number')
        .sort((a, b) => b.price - a.price);
      
      if (sortedByPrice.length > 0) {
        const mostExpensive = sortedByPrice[0];
        dynamicChunks.unshift({
          title: 'Pricing Summary - Most Expensive Product',
          url: `${siteUrl}/shop`,
          content: `The most expensive active product is "${mostExpensive.name}" (${mostExpensive.group_name || ''}) at $${Number(mostExpensive.price).toFixed(2)}.`
        });
      }
    }
    
    // Combine with static knowledge
    const allChunks = [...dynamicChunks, ...ragIndex.chunks];
    
    // Score chunks by keyword matching
    const scored = allChunks.map(chunk => ({
      chunk,
      score: keywordScore(query, `${chunk.title}\n${chunk.content}`)
    })).sort((a, b) => b.score - a.score);
    
    // Get top chunks
    const topChunks = scored.slice(0, 7).map(x => x.chunk);
    
    // Build context
    const context = topChunks
      .map(c => `Title: ${c.title}\nURL: ${c.url}\n\n${c.content}`)
      .join('\n\n---\n\n')
      .slice(0, 3500);
    
    if (!context.trim()) {
      return res.json({
        response: "I couldn't find relevant information about that. Try asking about our products, team, shipping, or contact info!",
        sources: []
      });
    }
    
    // Generate response with Cloudflare AI
    const prompt = 
      "You are Thrive Wellness's helpful AI assistant. " +
      "Answer the user's question using ONLY the context below. " +
      "For product prices, use the exact prices from the context. " +
      "Be concise, friendly, and conversational - give direct answers without repeating the entire context. " +
      "If asking about the most expensive product, identify it clearly by name and price. " +
      "If asking about bundle contents, list what's included clearly. " +
      "If the answer isn't in the context, say you don't know.\n\n" +
      `Context:\n${context}\n\n` +
      `User question: ${query}\n\n` +
      "Answer (be direct and natural, don't dump raw context):";
    
    let responseText;
    try {
      responseText = await callCloudflareAI(prompt);
      console.log(`✓ Generated response with Cloudflare AI`);
    } catch (err) {
      console.error('✗ Cloudflare AI error:', err.message);
      responseText = "I'm having trouble generating a response right now. Please try again.";
    }
    
    const sources = topChunks.slice(0, 3).map(c => ({
      content: c.content.slice(0, 200),
      url: c.url
    }));
    
    res.json({
      response: responseText,
      sources
    });
    
  } catch (err) {
    console.error('✗ Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Thrive Wellness Chatbot API (Dev)',
    rag_loaded: ragIndex !== null,
    chunks: ragIndex?.chunks?.length || 0
  });
});

const PORT = process.env.DEV_API_PORT || 8788;
const server = app.listen(PORT, () => {
  console.log(`\n🤖 Dev API server running on http://localhost:${PORT}`);
  console.log(`   RAG chunks: ${ragIndex?.chunks?.length || 0}`);
  console.log(`   Cloudflare AI: ${process.env.CF_ACCOUNT_ID ? 'Configured' : 'Not configured'}`);
  console.log(`   Supabase: ${process.env.VITE_SUPABASE_URL ? 'Configured' : 'Not configured'}\n`);
});

// Keep server alive
process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down dev API server...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down dev API server...');
  server.close(() => {
    process.exit(0);
  });
});
