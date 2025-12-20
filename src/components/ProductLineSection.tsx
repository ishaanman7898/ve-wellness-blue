import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product as SupabaseProduct } from "@/lib/supabase";
import type { Product as StaticProduct } from "@/data/products";

type Variant = (SupabaseProduct | StaticProduct) & Record<string, any>;

interface ProductLineSectionProps {
  variants: Variant[];
  index: number;
  addToCart: (item: { name: string; link: string; price: number; image?: string }) => void;
  sectionId: string;
  lineDescription: string;
}

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

export function ProductLineSection({
  variants,
  index,
  addToCart,
  sectionId,
  lineDescription,
}: ProductLineSectionProps) {
  const isEven = index % 2 === 0;

  const normalizedVariants = useMemo(() => {
    const mapped = variants
      .filter((v) => {
        // Filter out phased out and removal products
        const status = v.status;
        return status !== "Phased Out" && 
               status !== "Removal Requested" && 
               status !== "Removal Pending";
      })
      .map((v) => {
        const groupName = v.group_name ?? v.groupName ?? v.name;
        const buyLink = v.buy_link ?? v.buyLink ?? v.link;
        // Add cache-busting timestamp to image URLs
        const baseImage = v.image_url ?? v.image;
        const image = baseImage ? `${baseImage}?t=${Date.now()}` : baseImage;
        const hexColor = v.hex_color ?? v.hexColor ?? null;
        const variantOrder = v.variant_order ?? v.variantOrder ?? null;

        return {
          ...v,
          groupName,
          buyLink,
          image,
          hexColor,
          variantOrder,
        };
      });

    return mapped.sort((a, b) => {
      const aOrder = a.variantOrder ?? Number.POSITIVE_INFINITY;
      const bOrder = b.variantOrder ?? Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return String(a.sku || "").localeCompare(String(b.sku || ""));
    });
  }, [variants]);

  const displayVariants = useMemo(() => {
    const filtered = normalizedVariants.filter((variant) => variant.hexColor && variant.color);
    if (filtered.length === 0) {
      return normalizedVariants;
    }
    return filtered;
  }, [normalizedVariants]);

  const [selectedVariant, setSelectedVariant] = useState(displayVariants[0]);
  const [quantity, setQuantity] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Preload all variant images immediately
  useEffect(() => {
    setIsLoading(true);
    let loadedCount = 0;
    const totalImages = displayVariants.filter(v => v.image).length;

    if (totalImages === 0) {
      setIsLoading(false);
      return;
    }

    displayVariants.forEach((variant) => {
      if (variant.image) {
        const img = new Image();
        img.src = variant.image;
        img.onload = () => {
          setImagesLoaded((prev) => new Set(prev).add(variant.image));
          loadedCount++;
          if (loadedCount === totalImages) {
            setIsLoading(false);
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setIsLoading(false);
          }
        };
      }
    });
  }, [displayVariants]);

  useEffect(() => {
    setSelectedVariant(displayVariants[0]);
    setQuantity(1);
  }, [displayVariants]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        name: selectedVariant.name,
        link: selectedVariant.buyLink,
        price: selectedVariant.price,
        image: selectedVariant.image,
      });
    }
    setQuantity(1);
  };

  return (
    <section
      id={sectionId}
      className={cn(
        "relative min-h-screen flex items-center justify-center overflow-hidden py-12 md:py-20 bg-gradient-to-b from-slate-950 via-black to-slate-950"
      )}
    >


      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div
          className={cn(
            "grid lg:grid-cols-2 gap-12 items-center",
            isEven ? "" : "lg:grid-flow-dense"
          )}
        >
          {/* Product Image */}
          <div
            className={cn(
              "flex items-center justify-center min-h-[350px] lg:min-h-[500px]",
              !isEven && "lg:col-start-2"
            )}
          >
            <div className="relative w-full max-w-md group">
              {/* Loading Skeleton */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 rounded-2xl animate-pulse flex items-center justify-center">
                    <div className="space-y-4 text-center">
                      <div className="w-16 h-16 border-4 border-glacier/30 border-t-glacier rounded-full animate-spin mx-auto" />
                      <p className="text-white/60 text-sm font-medium">Loading images...</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Link to={`/product/${slugify(selectedVariant.groupName || selectedVariant.name)}?sku=${selectedVariant.sku}`}>
                {/* Preload all images hidden */}
                {displayVariants.map((variant) => (
                  variant.image && (
                    <img
                      key={variant.image}
                      src={variant.image}
                      alt={variant.name}
                      className={cn(
                        "w-full h-auto object-contain drop-shadow-2xl transition-all duration-200 group-hover:scale-105",
                        selectedVariant.id === variant.id && !isLoading ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
                      )}
                      loading="eager"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )
                ))}
              </Link>
            </div>
          </div>

          {/* Product Info */}
          <div
            className={cn(
              "flex flex-col justify-center",
              !isEven && "lg:col-start-1"
            )}
          >
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                  {selectedVariant.groupName || selectedVariant.name}
                </h2>
                <p className="text-lg text-white/70 font-light leading-relaxed max-w-lg">
                  {lineDescription}
                </p>
              </div>

              {/* Price */}
              <div className="text-4xl font-bold">
                ${selectedVariant.price.toFixed(2)}
              </div>

              {/* Variants */}
              {displayVariants.length > 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-white/60 uppercase tracking-widest font-medium">
                    Available {selectedVariant.category === "Supplements" || selectedVariant.category === "Wellness" ? "Flavors" : "Colors"}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {displayVariants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white relative flex items-center justify-center",
                          selectedVariant.id === variant.id
                            ? "border-white scale-110"
                            : "border-white/30",
                          variant.hexColor === "#FFFFFF" && "bg-white border-white"
                        )}
                        style={{
                          backgroundColor:
                            variant.hexColor !== "#FFFFFF" ? variant.hexColor : undefined,
                          backgroundImage: (variant.category === "Supplements" || variant.category === "Wellness") && !variant.hexColor ? "linear-gradient(45deg, #333, #666)" : undefined
                        }}
                        title={variant.color}
                      >
                        {selectedVariant.id === variant.id && (
                          <svg className={cn(
                            "w-5 h-5 drop-shadow-lg",
                            // Light colors get black checkmark, dark colors get white
                            variant.hexColor === "#FFFFFF" || 
                            variant.hexColor === "#FFF" ||
                            variant.hexColor?.match(/^#[89A-Fa-f]/) ? "text-black" : "text-white"
                          )} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="flex flex-row gap-3 pt-2 justify-start items-center w-full sm:w-auto">
                <div className="flex items-center justify-between gap-2 bg-white/10 backdrop-blur-md rounded-full px-3 sm:px-5 border border-white/20 h-12 w-auto">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg font-bold transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg font-bold transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90 font-bold text-base sm:text-lg rounded-full px-6 sm:px-8 h-12 flex-1 sm:flex-initial sm:min-w-[180px] transition-all duration-300"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>

              {/* Generic specs - Hidden on mobile */}
              <div className="hidden md:block pt-6 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-widest mb-1">
                      Category
                    </p>
                    <p className="text-lg font-semibold">{selectedVariant.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-widest mb-1">
                      Status
                    </p>
                    <p className="text-lg font-semibold">{selectedVariant.status || "In Stock"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-widest mb-1">
                      SKU
                    </p>
                    <p className="text-lg font-semibold">{selectedVariant.sku}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-widest mb-1">
                      Group
                    </p>
                    <p className="text-lg font-semibold">{selectedVariant.groupName || selectedVariant.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
