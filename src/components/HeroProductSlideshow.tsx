import { useState, useEffect } from "react";
import { products } from "@/data/products";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

export function HeroProductSlideshow() {
    // Select a curated list of products for the slideshow
    // We'll pick one from each main category to show variety
    const showcaseProductIds = ["bo-43", "su-pr-1", "su-el-6", "se-f-3", "o-di"];
    const showcaseProducts = products.filter(p => showcaseProductIds.includes(p.id));
    // Fallback if specific IDs don't match
    const displayProducts = showcaseProducts.length > 0 ? showcaseProducts : products.slice(0, 5);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const { addToCart } = useCart();

    useEffect(() => {
        if (isHovered) return; // Pause on hover

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [displayProducts.length, isHovered]);

    // Helper to get image path
    const getImagePath = (path: string | undefined) => {
        if (!path) return "/placeholder.svg";
        return path.replace(/^public\//, '/');
    };

    return (
        <div
            className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/20 group animate-fade-in-up"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {displayProducts.map((product, index) => (
                <div
                    key={product.id}
                    className={cn(
                        "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
                        index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                >
                    {/* Full Frame Image */}
                    <div className="absolute inset-0 bg-white/5">
                        <img
                            src={getImagePath(product.image)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Transparent Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                    {/* Content Overlay - Transparent Background */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs text-white/70 mb-1 font-medium tracking-wide">SKU: {product.sku}</p>
                        <h3 className="font-display text-2xl font-bold text-white mb-2 line-clamp-2 tracking-wide leading-tight">
                            <Link to={`/product/${product.id}`} className="hover:underline">
                                {product.name}
                            </Link>
                        </h3>

                        <div className="mt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-display font-bold text-white">${product.price.toFixed(2)}</span>

                                {/* Quantity - Just visual for the slideshow */}
                                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10 hidden sm:flex">
                                    <button className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors">−</button>
                                    <span className="w-8 text-center font-medium text-white text-sm">1</span>
                                    <button className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors">+</button>
                                </div>
                            </div>

                            <Button
                                onClick={() => addToCart({ ...product, quantity: 1, link: `/product/${product.id}` })}
                                className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Add to Cart
                            </Button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Slide Indicators */}
            <div className="absolute top-4 right-4 flex gap-1.5 z-30">
                {displayProducts.map((_, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300 shadow-sm",
                            idx === currentIndex ? "bg-white w-6" : "bg-white/40"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
