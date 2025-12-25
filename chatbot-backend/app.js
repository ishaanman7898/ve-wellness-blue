/**
 * FastAPI backend for Thrive Wellness RAG Chatbot
 * Serves chat API endpoint for the React frontend
 * With live Supabase product data integration
 */
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const dotenv = require('dotenv');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { HuggingFaceTransformersEmbeddings } = require('@langchain/community/embeddings/hf_transformers');
const { FaissStore } = require('@langchain/community/vectorstores/faiss');
const { Document } = require('@langchain/core/documents');

// Load environment variables from project root
const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env') });

// Debug: Verify environment variables are loaded
const cfAccount = process.env.CF_ACCOUNT_ID || '';
const cfToken = process.env.CF_API_TOKEN || '';
if (cfAccount && cfToken) {
  console.log(`[OK] Cloudflare credentials loaded (Account: ${cfAccount.substring(0, 8)}...)`);
} else {
  console.log('[ERROR] Cloudflare credentials not found in .env');
}

const app = express();
const PORT = process.env.PORT || 8000;
const SITE_URL = process.env.PUBLIC_SITE_URL || 'http://localhost:8080';
const BASE_DIR = __dirname;
const FAISS_INDEX_DIR = path.join(BASE_DIR, 'faiss_index');

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://quygevwkhlggdifdqqto.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1eWdldndraGxnZ2RpZmRxcXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDU5MjUsImV4cCI6MjA4MTQyMTkyNX0.dJybVffyolKTz0hNL4yVviEZ8KJ8iwdODt3I3Gp3ivg';

// CORS middleware for React frontend
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    SITE_URL,
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global variables for models
let embeddings = null;
let vectorDb = null;
let llm = null;

// Utility functions
function normalizeQuery(q) {
  if (!q) return '';
  return q.trim().replace(/\s+/g, ' ');
}

function stripUrlLines(text) {
  if (!text) return text;
  return text.replace(/^\s*url\s*:\s*\S+\s*$/gmi, '').trim();
}

function rewriteLocalUrl(url) {
  if (!url) return url;
  url = url.trim();
  if (url.startsWith('http://localhost:8080')) {
    return SITE_URL + url.substring('http://localhost:8080'.length);
  }
  if (url.startsWith('https://localhost:8080')) {
    return SITE_URL + url.substring('https://localhost:8080'.length);
  }
  return url;
}

async function fetchProductsFromSupabase() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/products?select=*&status=eq.In%20Store`;
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };
    const response = await axios.get(url, { headers, timeout: 10000 });
    return response.data;
  } catch (error) {
    console.log(`WARNING: Error fetching products from Supabase: ${error.message}`);
    return [];
  }
}

function formatProductsForContext(products) {
  if (!products || products.length === 0) return '';
  
  // Group products by category
  const categories = {};
  products.forEach(p => {
    const cat = p.category || 'Other';
    if (!categories[cat]) {
      categories[cat] = [];
    }
    categories[cat].push(p);
  });
  
  const lines = ['LIVE PRODUCT DATA FROM DATABASE:\n'];
  
  for (const [category, items] of Object.entries(categories)) {
    lines.push(`\n${category.toUpperCase()}:`);
    items.forEach(p => {
      const name = p.name || 'Unknown';
      const price = p.price || 0;
      const sku = p.sku || '';
      const status = p.status || '';
      const color = p.color || '';
      
      let line = `  - ${name}`;
      if (color) line += ` (${color})`;
      line += ` - $${price.toFixed(2)}`;
      if (sku) line += ` [SKU: ${sku}]`;
      lines.push(line);
    });
  }
  
  return lines.join('\n');
}

function isProductRelatedQuery(query) {
  const productKeywords = [
    'price', 'cost', 'how much', 'buy', 'purchase', 'product', 'products',
    'bottle', 'glacier', 'iceberg', 'surge', 'peak', 'protein', 'electrolyte',
    'shaker', 'anchor', 'bundle', 'alo', 'peloton', 'fall bundle',
    'supplement', 'accessory', 'accessories', 'water bottle',
    'flavor', 'flavors', 'chocolate', 'vanilla', 'pumpkin', 'lemonade',
    'strawberry', 'tropical', 'cucumber', 'apple cider', 'fruit punch',
    'blue raspberry', 'pina colada', 'inventory', 'stock', 'available',
    'sell', 'selling', 'offer', 'catalog', 'menu', 'list'
  ];
  const queryLower = query.toLowerCase();
  return productKeywords.some(keyword => queryLower.includes(keyword));
}

async function cloudflareAiGenerate(prompt) {
  const accountId = process.env.CF_ACCOUNT_ID?.trim();
  const apiToken = process.env.CF_API_TOKEN?.trim();
  const model = process.env.CF_AI_MODEL?.trim() || '@cf/meta/llama-3.1-8b-instruct';
  
  if (!accountId || !apiToken) {
    throw new Error('Cloudflare Workers AI not configured: set CF_ACCOUNT_ID and CF_API_TOKEN');
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
  const headers = {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  };
  const payload = { prompt };
  
  const response = await axios.post(url, payload, { headers, timeout: 60000 });
  const data = response.data;
  const result = data.result || {};
  
  if (typeof result === 'object' && result.response) {
    return String(result.response);
  }
  if (data.response) {
    return String(data.response);
  }
  throw new Error('Unexpected Cloudflare AI response format');
}

async function rewriteQueryForRetrieval(q) {
  if (!llm || process.env.RAG_ENABLE_QUERY_REWRITE !== '1') {
    return q;
  }
  try {
    const prompt = (
      'Rewrite the user\'s message into a clean, correctly spelled search query. ' +
      'Keep the meaning the same, keep it short, and do not add new facts. ' +
      'Return ONLY the rewritten query text.\n\n' +
      `User message: ${q}\n\n` +
      'Rewritten query:'
    );
    const rewritten = await llm.invoke(prompt) || '';
    const cleanRewritten = rewritten.replace(/^"|"$/g, '').trim();
    return normalizeQuery(cleanRewritten) || q;
  } catch (error) {
    return q;
  }
}

// Initialize models on startup
async function initializeModels() {
  try {
    console.log('Loading embeddings model...');
    embeddings = new HuggingFaceTransformersEmbeddings({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      modelOptions: { device: 'cpu' }
    });

    console.log('Loading FAISS index...');
    try {
      vectorDb = await FaissStore.load(FAISS_INDEX_DIR, embeddings);
      console.log('FAISS index loaded successfully!');
    } catch (error) {
      console.log(`Error loading FAISS index: ${error.message}`);
      if (process.env.AUTO_BUILD_FAISS_INDEX === '1') {
        try {
          console.log('FAISS index missing. Auto-building from knowledge_base.json...');
          const { ingestContent } = require('./ingest');
          vectorDb = await ingestContent();
          console.log('FAISS index built and loaded!');
        } catch (buildError) {
          console.log(`Auto-build failed: ${buildError.message}`);
          console.log("Run 'node ingest.js' first to create the index!");
          return;
        }
      } else {
        console.log("Run 'node ingest.js' first to create the index!");
        return;
      }
    }

    const llmProvider = process.env.LLM_PROVIDER?.trim().toLowerCase() || 'cloudflare';
    if (llmProvider === 'cloudflare') {
      llm = null;
      console.log('Cloudflare Workers AI selected (serverless)');
    } else {
      llm = null;
      console.log('LLM disabled or not available; using retrieval-only answers');
    }
  } catch (error) {
    console.error('Error initializing models:', error);
  }
}

// API Routes
app.get('/', async (req, res) => {
  res.json({
    status: 'online',
    message: 'Thrive Wellness Chatbot API',
    index_loaded: vectorDb !== null,
    supabase_configured: !!(SUPABASE_URL && SUPABASE_ANON_KEY)
  });
});

app.get('/products', async (req, res) => {
  const products = await fetchProductsFromSupabase();
  res.json({
    count: products.length,
    products: products
  });
});

app.post('/chat', async (req, res) => {
  if (!vectorDb) {
    return res.status(500).json({ error: 'Vector database not loaded' });
  }
  
  try {
    const { message, conversation_history = [] } = req.body;
    const userQuery = normalizeQuery(message);
    const retrievalQuery = await rewriteQueryForRetrieval(userQuery);

    // Retrieve relevant documents from knowledge base
    const topK = parseInt(process.env.RAG_TOP_K || '7');
    const fetchK = parseInt(process.env.RAG_FETCH_K || '20');
    
    const docs = await vectorDb.maxMarginalRelevanceSearch(retrievalQuery, {
      k: topK,
      fetchK: fetchK,
    });
    
    // Build context from knowledge base
    let kbContext = '';
    if (docs && docs.length > 0) {
      kbContext = docs.map(doc => stripUrlLines(doc.pageContent)).join('\n\n');
      const maxContextChars = parseInt(process.env.RAG_MAX_CONTEXT_CHARS || '3000');
      kbContext = kbContext.substring(0, maxContextChars);
    }
    
    // Fetch live product data from Supabase if query is product-related
    let productContext = '';
    if (isProductRelatedQuery(userQuery)) {
      const products = await fetchProductsFromSupabase();
      if (products && products.length > 0) {
        productContext = formatProductsForContext(products);
        console.log(`Fetched ${products.length} live products from Supabase`);
      }
    }
    
    // Combine contexts
    let fullContext = '';
    if (productContext) {
      fullContext = productContext + '\n\n' + kbContext;
    } else {
      fullContext = kbContext;
    }
    
    if (!fullContext.trim()) {
      return res.json({
        response: "I couldn't find relevant information about that. Try asking about our products, team, shipping, or contact info!",
        sources: []
      });
    }
    
    // Generate response
    const llmProvider = process.env.LLM_PROVIDER?.trim().toLowerCase() || 'cloudflare';
    
    const prompt = (
      'You are Thrive Wellness\'s helpful AI assistant. ' +
      'Answer the user\'s question using ONLY the context below. ' +
      'For product prices, ALWAYS use the LIVE PRODUCT DATA if available - these are the current real-time prices. ' +
      'Be concise, friendly, and helpful. Give direct answers without repeating the context. ' +
      'If the answer isn\'t in the context, say you don\'t know.\n\n' +
      `Context:\n${fullContext}\n\n` +
      `User question: ${userQuery}\n\n` +
      'Answer (be direct and conversational, don\'t just dump the context):'
    );
    
    let responseText;
    if (llmProvider === 'cloudflare') {
      try {
        responseText = await cloudflareAiGenerate(prompt);
        if (!responseText || responseText.trim().length < 10) {
          throw new Error('Empty or invalid response from Cloudflare AI');
        }
      } catch (cfError) {
        console.log(`WARNING: Cloudflare AI error: ${cfError.message}`);
        responseText = "I'm having trouble generating a response right now. Please try again.";
      }
    } else {
      responseText = "I'm having trouble generating a response right now. Please try again.";
    }
    
    const sources = docs ? docs.slice(0, 3).map(doc => ({
      content: doc.pageContent.substring(0, 200),
      title: doc.metadata?.title || 'Thrive Wellness'
    })) : [];
    
    res.json({ response: responseText, sources });
    
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
initializeModels().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Thrive Wellness Chatbot API running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize server:', error);
  process.exit(1);
});
