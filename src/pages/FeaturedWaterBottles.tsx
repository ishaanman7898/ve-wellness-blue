import { useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { products } from "@/data/products";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";

const featured = [
  products.find(p => p.groupName === "The Glacier"),
  products.find(p => p.groupName === "The Iceberg"),
].filter(Boolean);

export default function FeaturedWaterBottles() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Autoplay unless hovered
  React.useEffect(() => {
    if (hovered) return;
    timer.current = setInterval(() => {
      setIndex(i => (i + 1) % featured.length);
    }, 4000);
    return () => timer.current && clearInterval(timer.current);
  }, [hovered]);

  // Adaptive text color (if mostly white image)
  function textColor(img?: string) {
    if (!img) return "text-slate-900";
    if (img.includes("BO-46") || img.includes("BO-36")) return "text-slate-900";
    return "text-white";
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-navy-medium/30 to-background py-20">
        <h1 className="text-5xl md:text-7xl font-black mb-8 drop-shadow-sm text-center">Premium Water Bottles</h1>
        <div
          className="relative w-[360px] md:w-[520px] xl:w-[720px] aspect-[3/4] mx-auto rounded-3xl overflow-hidden bg-black/2 shadow-2xl group"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Image with gradient overlays and fade transition */}
          {featured.map((p, idx) => (
            <div
              key={p!.id}
              className={`absolute inset-0 transition-opacity duration-900 ${index === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            >
              <img
                src={p!.image}
                alt={p!.groupName}
                loading="lazy"
                className="object-contain w-full h-full bg-white/80"
                draggable={false}
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 pointer-events-none`}
              />
            </div>
          ))}
          {/* Arrows */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white border border-slate-400 rounded-full p-2 z-20 backdrop-blur"
            onClick={() => setIndex(idx => (idx - 1 + featured.length) % featured.length)}
            aria-label="Previous"
            style={{color: '#222'}}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white border border-slate-400 rounded-full p-2 z-20 backdrop-blur"
            onClick={() => setIndex(idx => (idx + 1) % featured.length)}
            aria-label="Next"
            style={{color: '#222'}}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          {/* Dots: click to jump to slide */}
          <div className="absolute bottom-5 w-full flex items-center justify-center gap-2 z-30">
            {featured.map((p, idx) => (
              <button
                key={p!.id}
                onClick={() => setIndex(idx)}
                className={`rounded-full w-3 h-3 border-2 border-white shadow ${idx === index ? 'bg-glacier' : 'bg-white/60'} transition-all`}
              />
            ))}
          </div>
          {/* Overlay content: groupName, size, price, and linkable */}
          <div className={`absolute bottom-0 left-0 w-full py-10 px-8 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col items-center rounded-b-3xl cursor-pointer ${textColor(featured[index]!.image)}`}
               onClick={() => navigate(`/product/${featured[index]!.id}`)}
          >
            <h2 className="font-display text-3xl md:text-5xl font-extrabold mb-2">{featured[index]!.groupName}</h2>
            <p className="font-bold text-lg mb-2 tracking-wider">{featured[index]!.groupName === 'The Glacier' ? '40 oz' : featured[index]!.groupName === 'The Iceberg' ? '32 oz' : ''}</p>
            <p className="text-2xl font-black tracking-tight">${featured[index]!.price.toFixed(2)}</p>
            <span className="inline-block mt-2 transition-opacity opacity-70 group-hover:opacity-100 underline text-base font-semibold">View Product</span>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
