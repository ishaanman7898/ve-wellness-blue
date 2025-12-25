"""
FastAPI backend for Thrive Wellness RAG Chatbot
Serves chat API endpoint for the React frontend
With live Supabase product data integration
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import os
import re
import requests
from pathlib import Path
from dotenv import load_dotenv
import warnings

# Suppress warnings
warnings.filterwarnings('ignore', category=DeprecationWarning)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TensorFlow warnings
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Disable oneDNN custom operations

# Load environment variables from project root
project_root = Path(__file__).parent.parent
env_path = project_root / '.env'
load_dotenv(env_path)

# Debug: Verify environment variables are loaded
cf_account = os.getenv("CF_ACCOUNT_ID", "")
cf_token = os.getenv("CF_API_TOKEN", "")
if cf_account and cf_token:
    print(f"[OK] Cloudflare credentials loaded (Account: {cf_account[:8]}...)")
else:
    print("[ERROR] Cloudflare credentials not found in .env")

# Try to import Ollama, fallback to simple retrieval if not available
try:
    from langchain_community.llms import Ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    print("Ollama not available. Using Cloudflare AI only.")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup"""
    global embeddings, vector_db, llm
    
    # Set UTF-8 encoding for Windows console
    import sys
    if sys.platform == 'win32':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except:
            pass
    
    print("Loading embeddings model...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'}
    )
    
    print("Loading FAISS index...")
    try:
        vector_db = FAISS.load_local(
            FAISS_INDEX_DIR,
            embeddings,
            allow_dangerous_deserialization=True
        )
        print("FAISS index loaded successfully!")
    except Exception as e:
        print(f"Error loading FAISS index: {e}")
        if os.getenv("AUTO_BUILD_FAISS_INDEX", "1") == "1":
            try:
                print("FAISS index missing. Auto-building from knowledge_base.json...")
                from ingest import ingest_content

                vector_db = ingest_content()
                print("FAISS index built and loaded!")
            except Exception as build_err:
                print(f"Auto-build failed: {build_err}")
                print("Run 'python ingest.py' first to create the index!")
                yield
                return
        else:
            print("Run 'python ingest.py' first to create the index!")
            yield
            return

    llm_provider = os.getenv("LLM_PROVIDER", "cloudflare").strip().lower()
    if llm_provider == "ollama" and OLLAMA_AVAILABLE:
        try:
            llm = Ollama(model=os.getenv("OLLAMA_MODEL", "llama3"))
            print("Ollama LLM ready!")
        except Exception as e:
            llm = None
            print(f"Ollama unavailable at runtime: {e}")
    elif llm_provider == "cloudflare":
        llm = None
        print("Cloudflare Workers AI selected (serverless)")
    else:
        llm = None
        print("LLM disabled or not available; using retrieval-only answers")
    
    yield
    
    # Cleanup (if needed)
    print("Shutting down...")

app = FastAPI(title="Thrive Wellness Chatbot API", lifespan=lifespan)

SITE_URL = os.getenv("PUBLIC_SITE_URL", "http://localhost:8080").rstrip("/")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FAISS_INDEX_DIR = os.path.join(BASE_DIR, "faiss_index")

# Supabase configuration
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "https://quygevwkhlggdifdqqto.supabase.co")
SUPABASE_ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1eWdldndraGxnZ2RpZmRxcXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDU5MjUsImV4cCI6MjA4MTQyMTkyNX0.dJybVffyolKTz0hNL4yVviEZ8KJ8iwdODt3I3Gp3ivg")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:5173",
        "http://localhost:3000",
        SITE_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
embeddings = None
vector_db = None
llm = None


def fetch_products_from_supabase():
    """Fetch live product data from Supabase"""
    try:
        url = f"{SUPABASE_URL}/rest/v1/products?select=*&status=eq.In%20Store"
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "Content-Type": "application/json"
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        products = response.json()
        return products
    except Exception as e:
        print(f"WARNING: Error fetching products from Supabase: {e}")
        return []


def format_products_for_context(products):
    """Format product data into readable context for the LLM"""
    if not products:
        return ""
    
    # Group products by category
    categories = {}
    for p in products:
        cat = p.get('category', 'Other')
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(p)
    
    lines = ["LIVE PRODUCT DATA FROM DATABASE:\n"]
    
    for category, items in categories.items():
        lines.append(f"\n{category.upper()}:")
        for p in items:
            name = p.get('name', 'Unknown')
            price = p.get('price', 0)
            sku = p.get('sku', '')
            status = p.get('status', '')
            color = p.get('color', '')
            
            line = f"  - {name}"
            if color:
                line += f" ({color})"
            line += f" - ${price:.2f}"
            if sku:
                line += f" [SKU: {sku}]"
            lines.append(line)
    
    return "\n".join(lines)


def is_product_related_query(query: str) -> bool:
    """Check if the query is about products, prices, or inventory"""
    product_keywords = [
        'price', 'cost', 'how much', 'buy', 'purchase', 'product', 'products',
        'bottle', 'glacier', 'iceberg', 'surge', 'peak', 'protein', 'electrolyte',
        'shaker', 'anchor', 'bundle', 'alo', 'peloton', 'fall bundle',
        'supplement', 'accessory', 'accessories', 'water bottle',
        'flavor', 'flavors', 'chocolate', 'vanilla', 'pumpkin', 'lemonade',
        'strawberry', 'tropical', 'cucumber', 'apple cider', 'fruit punch',
        'blue raspberry', 'pina colada', 'inventory', 'stock', 'available',
        'sell', 'selling', 'offer', 'catalog', 'menu', 'list'
    ]
    query_lower = query.lower()
    return any(keyword in query_lower for keyword in product_keywords)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:5173",
        "http://localhost:3000",
        SITE_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
embeddings = None
vector_db = None
llm = None


def _rewrite_local_url(url: str) -> str:
    if not url:
        return url
    url = url.strip()
    if url.startswith("http://localhost:8080"):
        return SITE_URL + url[len("http://localhost:8080"):]
    if url.startswith("https://localhost:8080"):
        return SITE_URL + url[len("https://localhost:8080"):]
    return url


def _strip_url_lines(text: str) -> str:
    if not text:
        return text
    return re.sub(r"(?im)^\s*url\s*:\s*\S+\s*$", "", text).strip()


def _normalize_query(q: str) -> str:
    q = (q or "").strip()
    q = re.sub(r"\s+", " ", q)
    return q


def _cloudflare_ai_generate(prompt: str) -> str:
    account_id = os.getenv("CF_ACCOUNT_ID", "").strip()
    api_token = os.getenv("CF_API_TOKEN", "").strip()
    model = os.getenv("CF_AI_MODEL", "@cf/meta/llama-3.1-8b-instruct").strip()
    if not account_id or not api_token:
        raise RuntimeError("Cloudflare Workers AI not configured: set CF_ACCOUNT_ID and CF_API_TOKEN")

    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json",
    }
    payload = {"prompt": prompt}
    resp = requests.post(url, headers=headers, json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    result = data.get("result") or {}
    if isinstance(result, dict) and "response" in result:
        return str(result["response"])
    if "response" in data:
        return str(data["response"])
    raise RuntimeError("Unexpected Cloudflare AI response format")


def _rewrite_query_for_retrieval(q: str) -> str:
    if llm is None:
        return q
    if os.getenv("RAG_ENABLE_QUERY_REWRITE", "1") != "1":
        return q
    try:
        prompt = (
            "Rewrite the user's message into a clean, correctly spelled search query. "
            "Keep the meaning the same, keep it short, and do not add new facts. "
            "Return ONLY the rewritten query text.\n\n"
            f"User message: {q}\n\n"
            "Rewritten query:"
        )
        rewritten = (llm.invoke(prompt) or "").strip()
        rewritten = re.sub(r"^\"|\"$", "", rewritten)
        return _normalize_query(rewritten) or q
    except Exception:
        return q

class ChatRequest(BaseModel):
    message: str
    conversation_history: list = []

class ChatResponse(BaseModel):
    response: str
    sources: list = []

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "Thrive Wellness Chatbot API",
        "ollama_available": OLLAMA_AVAILABLE,
        "index_loaded": vector_db is not None,
        "supabase_configured": bool(SUPABASE_URL and SUPABASE_ANON_KEY)
    }

@app.get("/products")
async def get_products():
    """Get live products from Supabase"""
    products = fetch_products_from_supabase()
    return {
        "count": len(products),
        "products": products
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat endpoint with live Supabase product data"""
    if vector_db is None:
        raise HTTPException(status_code=500, detail="Vector database not loaded")
    
    try:
        user_query = _normalize_query(request.message)
        retrieval_query = _rewrite_query_for_retrieval(user_query)

        # Retrieve relevant documents from knowledge base
        docs = vector_db.max_marginal_relevance_search(
            retrieval_query,
            k=int(os.getenv("RAG_TOP_K", "7")),
            fetch_k=int(os.getenv("RAG_FETCH_K", "20")),
        )
        
        # Build context from knowledge base
        kb_context = ""
        if docs:
            kb_context = "\n\n".join([_strip_url_lines(doc.page_content) for doc in docs])
            kb_context = kb_context[: int(os.getenv("RAG_MAX_CONTEXT_CHARS", "3000"))]
        
        # Fetch live product data from Supabase if query is product-related
        product_context = ""
        if is_product_related_query(user_query):
            products = fetch_products_from_supabase()
            if products:
                product_context = format_products_for_context(products)
                print(f"Fetched {len(products)} live products from Supabase")
        
        # Combine contexts
        full_context = ""
        if product_context:
            full_context = product_context + "\n\n" + kb_context
        else:
            full_context = kb_context
        
        if not full_context.strip():
            return ChatResponse(
                response="I couldn't find relevant information about that. Try asking about our products, team, shipping, or contact info!",
                sources=[]
            )
        
        # Generate response
        llm_provider = os.getenv("LLM_PROVIDER", "cloudflare").strip().lower()
        
        prompt = (
            "You are Thrive Wellness's helpful AI assistant. "
            "Answer the user's question using ONLY the context below. "
            "For product prices, ALWAYS use the LIVE PRODUCT DATA if available - these are the current real-time prices. "
            "Be concise, friendly, and helpful. Give direct answers without repeating the context. "
            "If the answer isn't in the context, say you don't know.\n\n"
            f"Context:\n{full_context}\n\n"
            f"User question: {user_query}\n\n"
            "Answer (be direct and conversational, don't just dump the context):"
        )
        
        if llm_provider == "cloudflare":
            try:
                response_text = _cloudflare_ai_generate(prompt)
                if not response_text or len(response_text.strip()) < 10:
                    raise Exception("Empty or invalid response from Cloudflare AI")
            except Exception as cf_err:
                print(f"WARNING: Cloudflare AI error: {cf_err}")
                # Try Ollama as fallback
                if llm is not None:
                    try:
                        response_text = llm.invoke(prompt)
                    except:
                        response_text = "I'm having trouble generating a response right now. Please try again."
                else:
                    response_text = "I'm having trouble generating a response right now. Please try again."
        elif llm is not None:
            try:
                response_text = llm.invoke(prompt)
            except Exception as llm_err:
                print(f"WARNING: LLM error: {llm_err}")
                response_text = "I'm having trouble generating a response right now. Please try again."
        else:
            response_text = "I'm having trouble generating a response right now. Please try again."
        
        sources = [
            {
                'content': doc.page_content[:200],
                'title': doc.metadata.get('title', 'Thrive Wellness')
            }
            for doc in docs[:3]
        ] if docs else []
        
        return ChatResponse(response=response_text, sources=sources)
    
    except Exception as e:
        print(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
