import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { products } from "@/data/products";
import { ShoppingCart, Trash2, Check, Minus, Plus } from "lucide-react";

interface CartItem { name: string; link: string; }

const STORAGE_KEY = "veCart";

export default function CartTest() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showIframes, setShowIframes] = useState(true);
  const [autoRedirect, setAutoRedirect] = useState(true);
  const [perItemDelayMs, setPerItemDelayMs] = useState(2000);
  const [finalBufferMs, setFinalBufferMs] = useState(3000);
  const [logs, setLogs] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<Record<number, "pending" | "sent" | "done">>({});
  const framesContainerRef = useRef<HTMLDivElement | null>(null);
  const [csvProducts, setCsvProducts] = useState<Array<{ name: string; link: string; price: number; image?: string }>>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setCart(Array.isArray(saved) ? saved : []);
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Simple CSV parser that supports quoted fields with commas
  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let cur: string[] = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
        } else { field += ch; }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { cur.push(field); field = ''; }
        else if (ch === '\n' || ch === '\r') {
          if (ch === '\r' && text[i + 1] === '\n') i++; // handle CRLF
          cur.push(field); field = '';
          if (cur.length > 1 || cur[0] !== '') rows.push(cur);
          cur = [];
        } else { field += ch; }
      }
    }
    if (field.length || cur.length) { cur.push(field); rows.push(cur); }
    return rows;
  };

  useEffect(() => {
    const loadCSV = async () => {
      try {
        const res = await fetch('/products.csv', { cache: 'no-store' });
        const text = await res.text();
        const rows = parseCSV(text);
        const header = rows[0] || [];
        const nameIdx = header.findIndex(h => /product\s*name/i.test(h));
        const linkIdx = header.findIndex(h => /buy\s*button\s*links?/i.test(h));
        const priceIdx = header.findIndex(h => /final\s*price|unit\s*price/i.test(h));
        const data = rows.slice(1)
          .filter(r => r[linkIdx] && r[linkIdx] !== 'N/A')
          .map(r => ({
            name: (r[nameIdx] || '').trim(),
            link: (r[linkIdx] || '').trim(),
            price: Number(String(r[priceIdx] || '0').replace(/[$,]/g, '')) || 0,
          }));
        setCsvProducts(data);
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] Loaded ${data.length} items from CSV`, ...prev]);
      } catch (e) {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] Failed to load CSV, falling back to products.ts`, ...prev]);
        setCsvProducts([]);
      }
    };
    loadCSV();
  }, []);

  const sampleProducts = csvProducts.length
    ? csvProducts
    : products.map(p => ({ name: p.name, link: p.buyLink, image: p.image, price: p.price }));

  const addToCart = (item: CartItem, quantity: number = 1) => {
    const items = Array(quantity).fill(item);
    setCart(prev => [...prev, ...items]);
    setLogs(prev => [
      `[${new Date().toLocaleTimeString()}] Added ${quantity}x to local cart: ${item.name}`,
      ...prev
    ]);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  const goToRealCheckout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Extract company code once
    const companyCode = cart[0].link.match(/buybuttons\/([a-z0-9]+)\//i)![1];
    const finalCartUrl = `https://portal.veinternational.org/buybuttons/${companyCode}/cart/`;

    alert(`Adding ${cart.length} items to your VEI cart...\nTiny windows will flash and auto-close (SUPER FAST)`);

    let addedCount = 0;

    // Process each item one by one with TINY popup
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      const url = `${item.link}?nocache=${Date.now() + i}`;

      // Completely invisible popup - pushed way off screen
      const popup = window.open(
        url,
        `vei_add_${i}`,
        "width=1,height=1,top=-10000,left=-10000,scrollbars=no,resizable=no,menubar=no,toolbar=no,location=no,status=no"
      );

      if (!popup || popup.closed) {
        alert("Please allow popups (just this once) so we can add all your items!");
        return;
      }

      // Auto-close when VEI finishes adding (detects success page)
      const checkInterval = setInterval(() => {
        try {
          if (
            popup.closed ||
            popup.location.href.includes("success") ||
            popup.location.href.includes("/cart") ||
            popup.document?.body?.innerText?.toLowerCase().includes("added")
          ) {
            clearInterval(checkInterval);
            popup.close();
            addedCount++;

            // When ALL items are done → open final cart in new tab
            if (addedCount === cart.length) {
              setTimeout(() => {
                window.open(finalCartUrl, "_blank");
                // alert(`All ${cart.length} items added successfully! Opening your cart now!`);
              }, 200);
            }
          }
        } catch (e) {
          // Cross-origin = normal, just keep waiting
        }
      }, 100); // Check every 0.1 sec (SUPER FAST)

      // Fallback: force close after 3 sec max
      setTimeout(() => {
        if (!popup.closed) popup.close();
      }, 3000);
    }

    // Clear your local cart
    setCart([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Fallback function for blocked popups (shows guide overlay)
  const showManualGuide = (remainingItems: CartItem[], finalUrl: string) => {
    const steps = remainingItems
      .map(item => `<li>Add ${item.name} (current tab will handle it)</li>`)
      .join("");

    const firstLink = remainingItems[0]?.link || finalUrl;
    const safeFirst = firstLink.endsWith("/") ? firstLink : `${firstLink}/`;

    const guide = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);color:white;z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:20px;">
        <h2>Popup Blocked? No Problem!</h2>
        <p>VEI will add items one by one. After each \"Added!\" page, click \"Continue Shopping\" or \"View Cart\", then come back here and click \"Next Item\".</p>
        <ol id="steps">
          ${steps}
          <li>Final: Go to cart</li>
        </ol>
        <button id="vei-next-item" style="margin:10px;padding:10px;background:green;color:white;border:none;">Start Next Item</button>
        <button id="vei-dismiss-guide" style="margin:10px;padding:10px;background:red;color:white;border:none;">Dismiss Guide</button>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", guide);

    const nextBtn = document.getElementById("vei-next-item");
    const dismissBtn = document.getElementById("vei-dismiss-guide");

    if (nextBtn) {
      nextBtn.onclick = () => {
        window.location.href = safeFirst;
      };
    }

    if (dismissBtn) {
      dismissBtn.onclick = () => {
        const parent = dismissBtn.parentElement as HTMLElement | null;
        if (parent && parent.parentElement) parent.parentElement.removeChild(parent);
      };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {isCheckingOut && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/90">
          <div className="text-center max-w-md px-6">
            <div className="mb-6 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
            <h2 className="font-display text-2xl font-bold mb-2">Building Your Wellness Cart</h2>
            <p className="text-muted-foreground mb-4">
              We're adding each item to your official VEI cart. This only takes a few seconds — keep this tab open.
            </p>
            <p className="text-xs text-muted-foreground">No need to click anything. We'll open your cart automatically when it's ready.</p>
          </div>
        </div>
      )}

      <section className="pt-44 pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Cart Test (Hidden)</h1>
          <p className="text-muted-foreground mb-8">This page demonstrates the VEI multi-item checkout workaround using localStorage and hidden iframes. Toggle debug options to see the iframes and logs.</p>

          {/* Debug Controls */}
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border p-4 bg-card">
              <div className="font-medium mb-3">Debug Options</div>
              <div className="flex items-center gap-3 mb-2">
                <input id="show-iframes" type="checkbox" checked={showIframes} onChange={(e) => setShowIframes(e.target.checked)} />
                <label htmlFor="show-iframes">Show iframes while buying</label>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <input id="auto-redirect" type="checkbox" checked={autoRedirect} onChange={(e) => setAutoRedirect(e.target.checked)} />
                <label htmlFor="auto-redirect">Auto-redirect to company cart after queue</label>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <label className="w-40" htmlFor="delay">Per-item delay (ms)</label>
                <input id="delay" type="number" min={500} step={100} value={perItemDelayMs} onChange={(e) => setPerItemDelayMs(parseInt(e.target.value || '0', 10))} className="w-28 px-2 py-1 rounded border border-border bg-background" />
              </div>
              <div className="flex items-center gap-3">
                <label className="w-40" htmlFor="buffer">Final buffer (ms)</label>
                <input id="buffer" type="number" min={1000} step={500} value={finalBufferMs} onChange={(e) => setFinalBufferMs(parseInt(e.target.value || '0', 10))} className="w-28 px-2 py-1 rounded border border-border bg-background" />
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 bg-card">
              <div className="font-medium mb-3">Action</div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={goToRealCheckout} className="rounded-full">Queue Checkout</Button>
                <Button onClick={() => window.open('/checkout-processing', 'checkout_process', 'left=127,top=184,width=694,height=750,scrollbars=yes,resizable=yes')} className="rounded-full bg-glacier hover:bg-glacier/90">Puppeteer Checkout</Button>
                <Button variant="secondary" onClick={clearCart} className="rounded-full">Clear Local Cart</Button>
                <Button variant="outline" onClick={() => window.open('https://portal.veinternational.org/cart', '_blank')} className="rounded-full">Open Global Cart</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
                    const popup = window.open(
                      randomProduct.link,
                      'test_popup',
                      "width=1,height=1,top=-10000,left=-10000,scrollbars=no,resizable=no,menubar=no,toolbar=no,location=no,status=no"
                    );
                    setLogs(prev => [`[${new Date().toLocaleTimeString()}] Test popup opened for: ${randomProduct.name}`, ...prev]);
                    setTimeout(() => {
                      if (popup && !popup.closed) popup.close();
                      setLogs(prev => [`[${new Date().toLocaleTimeString()}] Test popup closed`, ...prev]);
                    }, 3000);
                  }}
                  className="rounded-full"
                >
                  Test Popup
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 bg-card">
              <div className="font-medium mb-3">Queue Status</div>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                {cart.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="line-clamp-1">{c.name}</span>
                    <span className={
                      statuses[i] === 'done' ? 'text-emerald-500' : statuses[i] === 'sent' ? 'text-amber-500' : 'text-muted-foreground'
                    }>
                      {statuses[i] ?? 'pending'}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sampleProducts.map((p, idx) => {
              const qty = quantities[idx] || 1;
              return (
                <div key={idx} className="rounded-2xl border border-border p-4 bg-card flex flex-col">
                  <div className="h-40 flex items-center justify-center bg-muted/20 rounded-lg mb-3 overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="max-h-full object-contain" />
                    ) : (
                      <div className="text-6xl font-display text-foreground/10">{p.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="font-medium mb-1">{p.name}</div>
                  <div className="text-sm text-muted-foreground mb-3">${p.price.toFixed(2)}</div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mb-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantities(prev => ({ ...prev, [idx]: Math.max(1, qty - 1) }))}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <div className="flex-1 text-center font-medium">
                      Qty: {qty}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantities(prev => ({ ...prev, [idx]: Math.min(99, qty + 1) }))}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <Button onClick={() => addToCart({ name: p.name, link: p.link }, qty)} className="mt-auto rounded-full">
                    <ShoppingCart className="w-4 h-4 mr-2" /> Add {qty > 1 ? `${qty}x` : ''} to Cart
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Visible iframes for debugging */}
          <div className="mt-10">
            {showIframes && (
              <div>
                <div className="font-medium mb-2">Debug Iframes</div>
                <div ref={framesContainerRef} className="rounded-xl border border-border p-3 bg-card" />
              </div>
            )}
          </div>

          {/* Logs */}
          <div className="mt-8 rounded-xl border border-border p-4 bg-card">
            <div className="font-medium mb-2">Logs</div>
            <div className="text-xs text-muted-foreground space-y-1 max-h-64 overflow-auto">
              {logs.map((l, i) => (<div key={i}>{l}</div>))}
            </div>
          </div>

        </div>
      </section>

      {/* Floating cart widget (page-scoped) */}
      <div className="fixed top-6 right-6 z-[60]">
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <span className="inline-flex items-center gap-2 font-medium"><ShoppingCart className="w-4 h-4" /> Cart: {cart.length}</span>
          <Button size="sm" variant="secondary" onClick={goToRealCheckout} className="rounded-full">CHECKOUT NOW <Check className="w-4 h-4 ml-1" /></Button>
        </div>
        {cart.length > 0 && (
          <div className="mt-2 bg-card border border-border rounded-xl p-3 w-[280px]">
            <div className="max-h-60 overflow-auto space-y-2">
              {cart.map((c, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="line-clamp-1">{c.name}</span>
                  <button className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(i)} aria-label="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3">
              <Button variant="ghost" size="sm" onClick={clearCart}>Clear</Button>
              <Button size="sm" onClick={goToRealCheckout} className="rounded-full">Go to Checkout</Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
