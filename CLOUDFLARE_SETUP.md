# Cloudflare Pages Setup - Pure JavaScript! 🚀

## Overview

Your chatbot is now **100% JavaScript** - no Python needed! Everything runs on Cloudflare Pages/Workers for zero-cost, serverless deployment.

## What Changed

### Before (Python):
- ❌ Required Python installation
- ❌ Needed to run Python server locally
- ❌ Two separate processes (Vite + Python)
- ❌ Complex deployment

### After (JavaScript):
- ✅ Pure JavaScript/TypeScript
- ✅ Single `npm run dev` command
- ✅ Runs entirely on Cloudflare Workers
- ✅ Zero dependencies to install
- ✅ Deploy with one command

## Quick Start

### Development
```bash
npm run dev
```

That's it! This command:
1. Builds knowledge base (JavaScript)
2. Creates RAG index (JavaScript)
3. Starts Vite dev server
4. Chatbot works via Cloudflare Worker at `/api/chat`

Open http://localhost:8080 and the chatbot is ready!

### Production Build
```bash
npm run build
```

Automatically:
1. Builds knowledge base
2. Creates RAG index
3. Compiles React app
4. Bundles Cloudflare Worker
5. Ready to deploy!

### Deploy to Cloudflare
```bash
npx wrangler pages deploy dist
```

Or connect your GitHub repo to Cloudflare Pages for auto-deployment!

## How It Works

### Architecture

```
User types message
    ↓
ChatbotWidget (/api/chat)
    ↓
Cloudflare Worker (functions/api/chat.ts)
    ↓
├─→ RAG Index (public/rag_index.json)
├─→ Supabase (live product prices)
└─→ Cloudflare AI (response generation)
    ↓
User sees answer
```

### Files

**JavaScript Scripts:**
- `scripts/build-knowledge.js` - Builds knowledge base
- `scripts/build-rag-index.js` - Creates RAG index

**Generated Files:**
- `public/knowledge_base.json` - Raw knowledge (12 entries)
- `public/rag_index.json` - RAG index for Worker (28 chunks)

**Cloudflare Worker:**
- `functions/api/chat.ts` - Serverless chat endpoint

## Environment Variables

Set these in Cloudflare Pages dashboard:

```env
# Supabase (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Cloudflare AI (required)
CF_ACCOUNT_ID=your_account_id
CF_API_TOKEN=your_api_token
CF_AI_MODEL=@cf/meta/llama-3.1-8b-instruct
CF_EMBED_MODEL=@cf/baai/bge-small-en-v1.5

# Site URL
PUBLIC_SITE_URL=https://your-domain.com

# Optional tuning
RAG_TOP_K=7
RAG_MAX_CONTEXT_CHARS=3500
```

## Updating Content

### Edit Knowledge Base

1. Open `scripts/build-knowledge.js`
2. Edit the content sections
3. Run:
```bash
npm run build:knowledge
npm run build:rag
```

### Deploy Changes
```bash
npm run build
npx wrangler pages deploy dist
```

### Update Products
Just update in Supabase - no rebuild needed! The Worker fetches live data.

## Commands Reference

```bash
# Development
npm run dev                 # Build knowledge + RAG + start dev server

# Build scripts
npm run build:knowledge     # Build knowledge base only
npm run build:rag          # Build RAG index only

# Production
npm run build              # Full production build
npm run preview            # Preview production build locally

# Deploy
npx wrangler pages deploy dist
```

## GitHub Auto-Deployment

### Setup

1. **Connect Repository**
   - Go to Cloudflare Pages dashboard
   - Click "Create a project"
   - Connect your GitHub repo

2. **Configure Build**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`

3. **Add Environment Variables**
   - Go to Settings → Environment variables
   - Add all variables from above

4. **Deploy**
   - Push to main branch
   - Cloudflare auto-builds and deploys!

### Branch Previews

Every PR gets a preview URL automatically:
- `https://pr-123.your-project.pages.dev`

## Testing

### Test Locally
```bash
npm run dev
```

Open http://localhost:8080, scroll down, click chatbot:
- "What's your email?"
- "What's the most expensive product?"
- "What's in the Alo x Thrive bundle?"
- "Who is your CEO?"

### Test Production Build
```bash
npm run build
npm run preview
```

Test at http://localhost:4173

### Test Deployed Site
```bash
curl https://your-site.pages.dev/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"What is your email?"}'
```

## Troubleshooting

### "Module not found" errors
```bash
npm install
```

### Knowledge base not updating
```bash
npm run build:knowledge
npm run build:rag
```

### Chatbot not responding
1. Check browser console for errors
2. Verify environment variables in Cloudflare
3. Check Worker logs in Cloudflare dashboard

### Build fails on Cloudflare
1. Verify Node.js version (18+)
2. Check environment variables are set
3. Review build logs in Cloudflare dashboard

## Performance

### Local Development
- Build knowledge: ~100ms
- Build RAG index: ~50ms
- Total startup: ~1 second

### Production
- Cold start: 500ms-1s
- Warm requests: 200-500ms
- No server maintenance!

## Costs

Everything runs on free tiers:
- ✅ Cloudflare Pages: Free (500 builds/month)
- ✅ Cloudflare Workers: Free (100k requests/day)
- ✅ Cloudflare AI: Free (10k requests/day)
- ✅ Supabase: Free (500MB database)

**Total: $0/month!**

## Migration from Python

### What to Remove (Optional)

The Python backend is no longer needed for production:
- `chatbot-backend/app.py` - Keep for reference
- `chatbot-backend/requirements.txt` - Keep for reference
- `chatbot-backend/faiss_index/` - Not used in production

You can keep these files for local testing if you want, but they're not required.

### What's Now Used

- ✅ `scripts/build-knowledge.js` - JavaScript version
- ✅ `scripts/build-rag-index.js` - JavaScript version
- ✅ `functions/api/chat.ts` - Cloudflare Worker
- ✅ `public/rag_index.json` - Generated by JS scripts

## Benefits

### For Development
- ✅ Single command: `npm run dev`
- ✅ No Python installation needed
- ✅ Faster startup
- ✅ Easier for team members

### For Production
- ✅ Serverless - no servers to manage
- ✅ Auto-scaling
- ✅ Global CDN
- ✅ Zero cost
- ✅ One-command deployment

### For Maintenance
- ✅ Pure JavaScript codebase
- ✅ Easier to update
- ✅ No Python dependencies
- ✅ Simpler CI/CD

## Next Steps

1. **Test locally**: `npm run dev`
2. **Build**: `npm run build`
3. **Deploy**: `npx wrangler pages deploy dist`
4. **Set up auto-deployment**: Connect GitHub to Cloudflare Pages

## Support

- Email: thrivewellness.il@veinternational.org
- Cloudflare Docs: https://developers.cloudflare.com/pages/
- Cloudflare AI Docs: https://developers.cloudflare.com/workers-ai/

---

**You're now running a fully serverless, zero-cost AI chatbot! 🎉**
