# Thrive Wellness
**Current Version: v2.0.0**

Premium wellness e-commerce platform built with **React**, **Vite**, **Tailwind CSS**, and **Cloudflare Pages**. Features an AI-powered chatbot with live product data.

## 🚀 Quick Start

### First Time Setup
```bash
npm install
```

### Start Development
```bash
npm run dev
```

This single command:
- ✅ Builds knowledge base (JavaScript)
- ✅ Creates RAG index for chatbot
- ✅ Starts Vite dev server

**Access:**
- Website: `http://localhost:8080`
- Chatbot: Appears automatically on scroll!

**No Python needed!** Everything runs on Cloudflare Workers.

## 📦 Production Deployment

```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

Or connect your GitHub repo to Cloudflare Pages for automatic deployment!

See `CLOUDFLARE_SETUP.md` for detailed deployment guide.

## ✨ Features

### E-Commerce
- **Product Catalog**: Water bottles, supplements, accessories, bundles
- **Shopping Cart**: Persistent cart with Supabase integration
- **Product Management**: Admin panel for managing products
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### AI Chatbot
- **Smart Responses**: Powered by Cloudflare Workers AI
- **Live Product Data**: Fetches current prices from Supabase
- **Comprehensive Knowledge**: Company info, team, FAQ, shipping
- **Scroll-Based Visibility**: Appears when you need it
- **Zero Cost**: Runs entirely on Cloudflare's free tier

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Cloudflare Workers (serverless)
- **Database**: Supabase
- **AI**: Cloudflare Workers AI
- **Deployment**: Cloudflare Pages

## 📁 Project Structure

```
├── src/                    # React application
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   └── contexts/          # React contexts
├── functions/             # Cloudflare Workers
│   └── api/
│       └── chat.ts        # Chatbot API endpoint
├── scripts/               # Build scripts
│   ├── build-knowledge.js # Knowledge base builder
│   └── build-rag-index.js # RAG index builder
├── public/                # Static assets
│   ├── rag_index.json     # Chatbot knowledge (generated)
│   └── knowledge_base.json # Raw knowledge (generated)
└── dist/                  # Production build (generated)
```

## 🛠️ Commands

```bash
# Development
npm run dev                 # Build knowledge + start dev server

# Build scripts
npm run build:knowledge     # Build knowledge base only
npm run build:rag          # Build RAG index only

# Production
npm run build              # Full production build
npm run preview            # Preview production build

# Deploy
npx wrangler pages deploy dist
```

## 🔧 Environment Variables

Create a `.env` file:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Cloudflare AI
CF_ACCOUNT_ID=your_account_id
CF_API_TOKEN=your_api_token
CF_AI_MODEL=@cf/meta/llama-3.1-8b-instruct

# Site URL
PUBLIC_SITE_URL=http://localhost:8080
```

For production, set these in Cloudflare Pages dashboard.

## 📚 Documentation

- `CLOUDFLARE_SETUP.md` - Complete Cloudflare deployment guide
- `DEPLOYMENT.md` - General deployment information
- `CHATBOT_SETUP.md` - Chatbot configuration details

## 🤖 Chatbot Features

### Knowledge Base
- Company information and mission
- Leadership team and departments
- Product catalog (water bottles, supplements, accessories, bundles)
- Shipping information
- FAQ

### Live Data
- Product prices fetched from Supabase in real-time
- Always up-to-date inventory
- No rebuild needed for price changes

### Smart Positioning
- **Landing Page**: Bottom right, above pause/play button
- **Product Pages**: Bottom left, aligned with cart
- **Other Pages**: Bottom right
- **Scroll Behavior**: Shows/hides based on scroll position

## 🎯 Updating Content

### Update Chatbot Knowledge

1. Edit `scripts/build-knowledge.js`
2. Run:
```bash
npm run build:knowledge
npm run build:rag
```

### Update Products

Just update in Supabase admin panel - changes appear immediately!

### Deploy Changes

```bash
npm run build
npx wrangler pages deploy dist
```

## 💰 Costs

Everything runs on free tiers:
- ✅ Cloudflare Pages: Free (500 builds/month)
- ✅ Cloudflare Workers: Free (100k requests/day)
- ✅ Cloudflare AI: Free (10k requests/day)
- ✅ Supabase: Free (500MB database)

**Total: $0/month!**

## 🚀 Performance

- **Local Dev**: ~1 second startup
- **Production**: 200-500ms response time
- **Global CDN**: Fast worldwide
- **Auto-scaling**: Handles traffic spikes

## 📝 Changelog

### v2.0.0 - Pure JavaScript Migration
- Converted Python chatbot to JavaScript
- Integrated with Cloudflare Workers
- Single command development
- Zero Python dependencies
- Improved build process

### v1.9.0 - Product Management
- Enhanced product management UI
- Drag-and-drop variant ordering
- Improved filter UI/UX
- Storefront integration

## 📄 License

[MIT License](LICENSE)

## 📧 Contact

Email: thrivewellness.il@veinternational.org

---

**Built with ❤️ by Thrive Wellness Team**
