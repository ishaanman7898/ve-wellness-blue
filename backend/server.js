import express from "express";
import puppeteer from "puppeteer";

const app = express();
app.use(express.json());

// CORS middleware for cross-origin requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Store checkout sessions
const checkoutSessions = new Map();

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Checkout route - starts the puppeteer process
app.post("/checkout", async (req, res) => {
  const items = req.body.items || [];
  if (!items.length) {
    return res.status(400).json({ error: "No items to process" });
  }

  // Generate a session ID
  const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);

  // Initialize session status
  checkoutSessions.set(sessionId, {
    status: "processing",
    totalItems: items.length,
    processedItems: 0,
    finalCartUrl: null,
    startTime: Date.now()
  });

  // Respond immediately with session ID
  res.json({ ok: true, sessionId });

  console.log(`🛒 Checkout started (Session: ${sessionId}). Items:`, items.length);

  const finalCartUrl = "https://portal.veinternational.org/buybuttons/us019814/cart/";

  try {
    const browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === "production" ? true : false,
      defaultViewport: null,
      args: [
        "--window-position=400,100",
        "--window-size=700,900",
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ]
    });

    const page = await browser.newPage();

    for (let i = 0; i < items.length; i++) {
      const { name, url } = items[i];
      console.log(`[${i + 1}/${items.length}] Adding → ${name}`);

      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await new Promise(r => setTimeout(r, 500));
        const session = checkoutSessions.get(sessionId);
        if (session) session.processedItems = i + 1;
      } catch (e) {
        console.log("❌ Error loading:", name, e.message);
      }
    }

    console.log("➡️ Opening final cart…");
    await page.goto(finalCartUrl, { waitUntil: "networkidle2", timeout: 30000 });

    const session = checkoutSessions.get(sessionId);
    if (session) {
      session.status = "complete";
      session.finalCartUrl = finalCartUrl;
    }

    console.log(`🎉 Done! (Session: ${sessionId})`);
    // Don't close browser - for user interaction
  } catch (error) {
    console.error("Checkout error:", error);
    const session = checkoutSessions.get(sessionId);
    if (session) {
      session.status = "error";
      session.error = error.message;
    }
  }
});

// Get checkout status
app.get("/checkout/status/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = checkoutSessions.get(sessionId);
  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json(session);
});

// Cleanup old sessions (older than 1 hour)
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [id, session] of checkoutSessions) {
    if (session.startTime < oneHourAgo) checkoutSessions.delete(id);
  }
}, 60 * 1000);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Cart server running → http://localhost:${PORT}`);
});
