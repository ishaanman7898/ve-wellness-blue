import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bot, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatbotWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm the Thrive Wellness assistant. I know everything about our products, prices, team, shipping, and FAQs. Ask me anything!",
    },
  ]);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const quickReplies = [
    "What's your most expensive product?",
    "What colors does The Iceberg come in?",
    "Who is your CEO?",
    "What are your shipping options?",
  ];

  const endRef = useRef<HTMLDivElement>(null);

  // Determine page type for positioning
  const isLandingPage = location.pathname === "/";
  const isProductPage = location.pathname.startsWith("/shop") || location.pathname.startsWith("/product/");
  const isCompanyOrSupportPage = useMemo(() => {
    const companyPages = ["/about", "/mission", "/team", "/newsletter"];
    const supportPages = ["/faq", "/shipping", "/contact"];
    return [...companyPages, ...supportPages].some(page => location.pathname === page);
  }, [location.pathname]);

  // Position logic
  const anchorClass = useMemo(() => {
    if (isProductPage) {
      // Bottom left on product pages, aligned with floating cart
      return "bottom-6 left-6";
    } else if (isCompanyOrSupportPage) {
      // Bottom right on company/support pages (where cart would be)
      return "bottom-6 right-6";
    } else if (isLandingPage) {
      // Above pause/play button on landing page (bottom-4 right-4 for pause button)
      return "bottom-20 right-4";
    }
    return "bottom-6 right-6";
  }, [isProductPage, isCompanyOrSupportPage, isLandingPage]);

  // Scroll detection - show on scroll down, keep visible on scroll up
  useEffect(() => {
    // Company/Support pages: always visible
    if (isCompanyOrSupportPage) {
      setIsVisible(true);
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const viewportHeight = window.innerHeight;
          
          // Show chatbot when scrolled past threshold
          if (isLandingPage) {
            // Landing page: show after scrolling past 80% of viewport
            setIsVisible(currentScrollY > viewportHeight * 0.8);
          } else {
            // Other pages: show after scrolling 100px
            setIsVisible(currentScrollY > 100);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial scroll position
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLandingPage, isCompanyOrSupportPage]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const send = async (text?: string) => {
    const message = text || input.trim();
    if (!message || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setIsLoading(true);
    setShowQuickReplies(false);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversation_history: messages.slice(-10),
        }),
      });

      const data = await resp.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data?.response || "" }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Chat service error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render at all if not visible (except on company/support pages where it's always visible)
  if (!isVisible && !isCompanyOrSupportPage) {
    return null;
  }

  return (
    <>
      {/* Chat Panel */}
      <div
        className={`fixed ${anchorClass} z-[80] w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl border-2 border-glacier/30 bg-card shadow-2xl overflow-hidden transition-all duration-700 ease-out ${
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-12 pointer-events-none"
        }`}
        style={{ 
          transform: isOpen ? "translateY(-80px)" : "translateY(-72px)",
          transformOrigin: isProductPage ? "bottom left" : "bottom right"
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-accent">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--navy-deep))] flex items-center justify-center animate-pulse">
              <Bot className="w-6 h-6 text-glacier" />
            </div>
            <div>
              <div className="text-base font-bold text-[hsl(var(--navy-deep))]">Thrive AI Assistant</div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[hsl(var(--navy-deep))]/70 hover:text-[hsl(var(--navy-deep))] transition-colors p-1 hover:bg-[hsl(var(--navy-deep))]/10 rounded-full"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto px-4 py-3 space-y-3 bg-background/50">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm animate-fade-in-up ${m.role === "user" ? "text-right" : "text-left"}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div
                className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  m.role === "user"
                    ? "bg-gradient-accent text-[hsl(var(--navy-deep))] font-medium"
                    : "bg-muted text-foreground border border-border"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          
          {/* Quick Reply Buttons */}
          {showQuickReplies && messages.length === 1 && !isLoading && (
            <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <div className="text-xs text-muted-foreground text-center mb-2">Quick questions:</div>
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => send(reply)}
                  className="w-full text-left text-sm px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
          
          {isLoading && (
            <div className="text-left animate-fade-in">
              <div className="inline-block bg-muted rounded-2xl px-4 py-2.5 border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-glacier rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-glacier rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-glacier rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t-2 border-glacier/20 p-3 bg-card">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={isLoading}
              placeholder="Ask about products, prices, team..."
              className="flex-1 border-glacier/30 focus:border-glacier transition-all"
            />
            <Button 
              size="icon" 
              onClick={() => send()} 
              disabled={isLoading || !input.trim()}
              className="bg-gradient-accent hover:opacity-90 text-[hsl(var(--navy-deep))] transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`fixed ${anchorClass} z-[80] rounded-full shadow-2xl transition-all duration-700 ease-out bg-gradient-accent hover:scale-110 active:scale-95 p-4 border-2 border-glacier/50 ${
          isOpen 
            ? "opacity-0 scale-75 pointer-events-none rotate-90" 
            : isVisible 
              ? "opacity-100 scale-100 rotate-0" 
              : "opacity-0 scale-75 pointer-events-none"
        }`}
        style={{
          transformOrigin: isProductPage ? "bottom left" : "bottom right"
        }}
        aria-label="Open chat"
      >
        <Bot className="w-6 h-6 text-[hsl(var(--navy-deep))]" />
      </button>
    </>
  );
}
