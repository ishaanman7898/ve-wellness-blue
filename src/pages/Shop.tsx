import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { products, categories, Product } from "@/data/products";
import { Search, ShoppingBag, ArrowUpDown, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";

interface ShopProps {
  category?: string;
}

export default function Shop({ category: categoryProp }: ShopProps = {}) {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState(categoryProp || categoryParam || "All");

  // Update selected category when URL param or prop changes
  useEffect(() => {
    if (categoryProp) {
      setSelectedCategory(categoryProp);
    } else if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory("All");
    }
  }, [categoryParam, categoryProp]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.groupName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.groupName.localeCompare(b.groupName);
        case "name-desc":
          return b.groupName.localeCompare(a.groupName);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }, [selectedCategory, searchQuery, sortBy]);

  // Group products by groupName
  const groupedProducts = useMemo(() => {
    const groups: { [key: string]: Product[] } = {};

    filteredAndSortedProducts.forEach(product => {
      if (!groups[product.groupName]) {
        groups[product.groupName] = [];
      }
      groups[product.groupName].push(product);
    });

    return Object.values(groups);
  }, [filteredAndSortedProducts]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative">
        <div className="absolute inset-0 matrix-dots opacity-10" aria-hidden="true"></div>

        {/* Hero Section */}
        <section className="pt-48 pb-20 bg-gradient-to-b from-primary/10 to-background relative overflow-hidden">
          {/* Matrix Dots Background */}
          <div className="absolute inset-0 matrix-dots opacity-20"></div>

          <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Shop <span className="text-gradient">Thrive</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Premium wellness products designed for those who demand more from life.
            </p>
          </div>
        </section>

        {/* Filters & Products */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                  <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {groupedProducts.length} products
            </p>

            {/* Products Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {groupedProducts.map((group, index) => (
                <ProductCard key={group[0].id} variants={group} index={index} />
              ))}
            </div>

            {/* Empty State */}
            {groupedProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}

function ProductCard({ variants, index }: { variants: Product[]; index: number }) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    setSelectedVariant(variants[0]);
  }, [variants]);

  const product = selectedVariant;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Wellness":
        return "bg-emerald-500/10 text-emerald-700";
      case "Water Bottles":
        return "bg-sky-500/10 text-sky-600";
      case "Bundles":
        return "bg-orange-500/10 text-orange-600";
      case "Accessories":
        return "bg-purple-500/10 text-purple-600";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case "Wellness":
        return "bg-emerald-500/5";
      case "Water Bottles":
        return "bg-sky-500/5";
      case "Bundles":
        return "bg-orange-500/5";
      case "Accessories":
        return "bg-purple-500/5";
      default:
        return "bg-primary/5";
    }
  };

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        name: product.name,
        link: product.buyLink,
        price: product.price,
        image: product.image,
      });
    }
    setQuantity(1);
  };

  return (
    <div
      className={cn(
        "group relative rounded-2xl overflow-hidden transition-all duration-500 h-[500px] shadow-xl hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 animate-fade-in-up border border-border/50",
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Full Background Image */}
      <div className="absolute inset-0 bg-white">
        <Link to={`/product/${slugify(product.groupName)}`} className="absolute inset-0 z-10" aria-label={`View ${product.groupName}`} />
        {product.image ? (
          <img
            key={product.image}
            src={product.image.replace(/^public\//, '/')}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}

        {/* Fallback Placeholder */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-gray-100",
          product.image ? "hidden" : ""
        )}>
          <div className="text-6xl font-display font-bold text-gray-300">
            {product.groupName.charAt(0)}
          </div>
        </div>
      </div>

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Top badges */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md",
          getCategoryColor(product.category).replace('text-', 'bg-white/90 text-').replace('bg-', 'border-0 ')
        )}>
          {product.category}
        </span>
      </div>

      {/* Product Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col z-20 text-white">
        <p className="text-xs text-white/70 mb-1 font-medium tracking-wide">SKU: {product.sku}</p>
        <h3 className="font-display text-2xl font-bold mb-3 line-clamp-2 tracking-wide leading-tight shadow-black/50 drop-shadow-md">
          <Link to={`/product/${slugify(product.groupName)}`} className="hover:underline">
            {product.groupName}
          </Link>
        </h3>

        {/* Variant Swatches */}
        {variants.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedVariant(variant);
                }}
                className={cn(
                  "w-6 h-6 rounded-full border border-white/30 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm",
                  selectedVariant.id === variant.id && "ring-2 ring-white scale-110",
                  variant.hexColor === "#FFFFFF" && "bg-white",
                )}
                style={{ backgroundColor: variant.hexColor }}
                title={variant.color}
              />
            ))}
          </div>
        )}

        <div className="mt-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-display font-bold">${product.price.toFixed(2)}</span>

            {/* Quantity Selector */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center font-medium text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(99, quantity + 1))}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <Button
            variant="default"
            size="lg"
            className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
