import { useMemo, useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase, Product } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Minus, Plus } from "lucide-react";

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const initialSku = searchParams.get("sku");

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Add cache-busting timestamp to image URLs
        const productsWithFreshImages = (data || []).map(product => ({
          ...product,
          image_url: product.image_url ? `${product.image_url}?t=${Date.now()}` : product.image_url
        }));
        
        setProducts(productsWithFreshImages as Product[]);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const variants = useMemo(() => {
    const group = products.filter(p => {
      const isVisible = p.status !== "Phased Out" && p.status !== "Removal Requested" && p.status !== "Removal Pending";
      const matchesSlug = slugify(p.group_name || p.name) === slug;
      return isVisible && matchesSlug;
    });
    return group.sort((a, b) => {
      const aOrder = a.variant_order ?? Number.POSITIVE_INFINITY;
      const bOrder = b.variant_order ?? Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return String(a.sku || '').localeCompare(String(b.sku || ''));
    });
  }, [slug, products]);

  // Determine initial selection based on SKU param or default to first
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    if (variants.length > 0) {
      if (initialSku) {
        const found = variants.find(v => v.sku === initialSku);
        setSelected(found || variants[0]);
      } else {
        setSelected(variants[0]);
      }
    }
  }, [variants, initialSku]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/shop" className="text-blue-400 hover:text-blue-300 underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const isSupplement = selected.category === "Wellness" || selected.category === "Supplements";

  const handleAddToCart = () => {
    addToCart(
      {
        name: selected.name,
        link: selected.buy_link,
        price: selected.price,
        image: selected.image_url,
      },
      quantity
    );
  };

  // Use variant-specific description from database
  const displayDescription = selected.description || `Discover ${selected.group_name || selected.name} — premium quality designed to elevate your routine. Choose your ${isSupplement ? "flavor" : "color"} and enjoy exceptional performance.`;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section with Product Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 md:pt-20 bg-gradient-to-b from-slate-900 via-black to-black">


        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Product Image - Left Side */}
            <div className="flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
              <div className="relative w-full max-w-sm">
                {selected.image_url ? (
                  <img
                    src={selected.image_url}
                    alt={selected.name}
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-8xl font-display text-white/10">
                    {selected.group_name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info - Right Side */}
            <div className="flex flex-col justify-center space-y-6">
              {/* Breadcrumbs */}
              <div className="text-sm text-white/60">
                <Link to="/shop" className="hover:text-white transition">Shop</Link>
                <span className="mx-2">/</span>
                <span className="text-white">{selected.group_name}</span>
              </div>

              {/* Title */}
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-2">
                  {selected.group_name}
                </h1>
                <p className="text-base text-white/70 font-light leading-relaxed max-w-md">
                  {displayDescription}
                </p>
              </div>

              {/* Price & Actions Row */}
              <div className="flex flex-col items-start gap-6">
                {/* Price */}
                <div className="text-3xl font-bold text-glacier">
                  ${selected.price.toFixed(2)}
                </div>

                {/* Variants */}
                {variants.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-xs text-white/60 uppercase tracking-widest font-medium">
                      Available {isSupplement ? "Flavors" : "Colors"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelected(variant)}
                          className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white",
                            selected.id === variant.id
                              ? "border-white scale-110"
                              : "border-white/30 hover:border-white/60",
                            variant.hex_color === "#FFFFFF" && "bg-white border-white"
                          )}
                          style={{
                            backgroundColor: variant.hex_color !== "#FFFFFF" ? variant.hex_color : undefined,
                            backgroundImage: isSupplement && !variant.hex_color ? "linear-gradient(45deg, #333, #666)" : undefined // Fallback for flavor if no color
                          }}
                          title={variant.color}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-white/80">{selected.color}</p>
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-3">
                  {/* Quantity */}
                  <div className="flex items-center h-10 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-full hover:bg-white/10 flex items-center justify-center text-lg font-bold transition-colors rounded-l-full"
                      aria-label="Decrease"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      className="w-10 h-full hover:bg-white/10 flex items-center justify-center text-lg font-bold transition-colors rounded-r-full"
                      aria-label="Increase"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 font-bold text-base rounded-full h-10 px-6 transition-all duration-300"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>



              {/* Dynamic Specifications */}
              {selected.specifications && (
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-white/80 mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selected.specifications).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-[10px] text-white/60 uppercase tracking-widest mb-0.5">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-sm font-semibold">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isSupplement && (
                <div className="pt-4 border-t border-white/10">
            
                
                </div>
              )}

            </div>
          </div>
        </div>
      </section>


   

      {/* Related Products */}
      <section className="py-20 bg-slate-950">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-12 tracking-tight">Explore More</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products
              .filter(p => p.category === selected.category && p.group_name !== selected.group_name && p.status !== "Phased Out" && p.status !== "Removal Requested")
              // We need to dedupe by group name for "Explore More" to avoid showing all colors of same product
              .filter((p, index, self) =>
                index === self.findIndex((t) => (
                  t.group_name === p.group_name
                ))
              )
              .slice(0, 4)
              .map((p, i) => (
                <ExploreCard key={`${p.id}-${i}`} product={p} allProducts={products} />
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ExploreCard({ product, allProducts }: { product: Product, allProducts: Product[] }) {
  // Get all variants for this product group, filtering out removed/phased out products
  const variants = allProducts.filter(p => 
    p.group_name === product.group_name && 
    p.status !== "Phased Out" && 
    p.status !== "Removal Requested"
  ).sort((a, b) => {
    const aOrder = a.variant_order ?? Number.POSITIVE_INFINITY;
    const bOrder = b.variant_order ?? Number.POSITIVE_INFINITY;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return String(a.sku || '').localeCompare(String(b.sku || ''));
  });
  const [hoveredVariant, setHoveredVariant] = useState(product);

  return (
    <Link
      to={`/product/${slugify(product.group_name || product.name)}?sku=${hoveredVariant.sku}`}
      className="group block"
      onMouseLeave={() => setHoveredVariant(variants[0])}
    >
      <div className="aspect-square bg-black rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-white/30 transition relative">
        {/* Main Image (swaps on hover if variant selected) */}
        {hoveredVariant.image_url ? (
          <img
            src={hoveredVariant.image_url}
            alt={hoveredVariant.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-6xl font-display text-white/10">{(hoveredVariant.group_name || hoveredVariant.name).charAt(0)}</div>
        )}

        {/* Variant Swatches on Hover - positioned absolute bottom */}
        {variants.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-2">
            {variants.slice(0, 5).map(v => (
              <span
                key={v.id}
                className={cn(
                  "w-4 h-4 rounded-full border border-white/50 cursor-pointer shadow-sm",
                  hoveredVariant.id === v.id ? "scale-110 border-white" : ""
                )}
                style={{ backgroundColor: v.hex_color }}
                onMouseEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation(); // prevent link click? No, we want hover
                  setHoveredVariant(v);
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="font-display font-bold text-white tracking-tight mb-1">{product.group_name || product.name}</div>
      <div className="text-white/70 text-sm">${product.price.toFixed(2)}</div>
    </Link>
  );
}
