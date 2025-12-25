"""
Ingest knowledge base and create vector embeddings
"""
import json
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

def ingest_content():
    """Load knowledge base and create FAISS index"""
    print("📚 Loading knowledge base...")

    base_dir = os.path.dirname(os.path.abspath(__file__))
    knowledge_path = os.path.join(base_dir, 'knowledge_base.json')
    faiss_index_dir = os.path.join(base_dir, 'faiss_index')
    
    if not os.path.exists(knowledge_path):
        print("❌ knowledge_base.json not found!")
        print("   Run 'python build_knowledge.py' first to create it.")
        return None
    
    with open(knowledge_path, 'r', encoding='utf-8') as f:
        knowledge_data = json.load(f)
    
    # Convert to LangChain documents
    documents = []
    for entry in knowledge_data:
        doc = Document(
            page_content=f"Title: {entry['title']}\n\n{entry['content']}",
            metadata={'title': entry['title']}
        )
        documents.append(doc)
    
    print(f"✅ Loaded {len(documents)} knowledge entries")
    
    # Split into chunks
    print("🔪 Splitting into chunks...")
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = splitter.split_documents(documents)
    print(f"✅ Created {len(chunks)} chunks")
    
    # Create embeddings
    print("🧠 Creating embeddings (this may take a minute)...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'}
    )
    
    # Create FAISS vector store
    print("📊 Building FAISS index...")
    vector_db = FAISS.from_documents(chunks, embeddings)
    
    # Save to disk
    vector_db.save_local(faiss_index_dir)
    print(f"✅ Index saved to '{faiss_index_dir}'")
    
    return vector_db

if __name__ == "__main__":
    ingest_content()
    print("\n🎉 Done! The chatbot is ready to use.")
