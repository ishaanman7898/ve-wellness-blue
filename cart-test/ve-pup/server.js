import express from "express";
import puppeteer from "puppeteer";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

const finalCartUrl =
  "https://portal.veinternational.org/buybuttons/us019814/cart/";

// your custom window settings
const WINDOW_X = 1211;
const WINDOW_Y = 264;
const WINDOW_W = 658;
const WINDOW_H = 727;

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

// Checkout route
app.post("/checkout", async (req, res) => {
  const items = req.body.items || [];
  if (!items.length) {
    return res.status(400).json({ error: "No items to process" });
  }

  res.json({ ok: true }); // respond immediately so frontend stays on page

  console.log("🛒 Checkout started. Items:", items.length);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      `--window-position=${WINDOW_X},${WINDOW_Y}`,
      `--window-size=${WINDOW_W},${WINDOW_H}`
    ]
  });

  const page = await browser.newPage();

  for (let i = 0; i < items.length; i++) {
    const { name, url } = items[i];
    console.log(`[${i + 1}/${items.length}] Adding → ${name}`);

    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await new Promise(r => setTimeout(r, 350)); // delay
    } catch (e) {
      console.log("❌ Error loading:", name, e);
    }
  }

  console.log("➡️ Opening final cart…");
  await page.goto(finalCartUrl, { waitUntil: "networkidle2" });

  console.log("🎉 Done!");
});

app.listen(3000, () => {
  console.log("Server running → http://localhost:3000");
});
