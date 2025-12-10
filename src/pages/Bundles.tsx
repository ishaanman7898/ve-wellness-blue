import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { products, Product } from "@/data/products";
import { useProductsCsv } from "@/hooks/useProductsCsv";
import { ShoppingCart, Package, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";

export default function BundlesPage() {
    const { addToCart } = useCart();
    const { products: csvProducts } = useProductsCsv();
    const sourceProducts = csvProducts.length ? csvProducts : products;

    const bundlesProducts = useMemo(() => {
        return sourceProducts.filter((product) => product.category === "Bundles");
    }, [sourceProducts]);

    const groupedProducts = useMemo(() => {
        const groups: { [key: string]: Product[] } = {};
        bundlesProducts.forEach(product => {
            if (!groups[product.groupName]) {
                groups[product.groupName] = [];
            }
            groups[product.groupName].push(product);
        });
        
        // Split groups with <5 variants into individual products
        const result: Product[][] = [];
        Object.values(groups).forEach(group => {
            if (group.length < 5) {
                // Split into individual products
                group.forEach(product => result.push([product]));
            } else {
                // Keep as grouped
                result.push(group);
            }
        });
        
        return result;
    }, [bundlesProducts]);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="relative">
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Image Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background"></div>
                    <div className="absolute inset-0 matrix-dots opacity-10" aria-hidden="true"></div>
                </div>
                
                {/* Darker overlay for text readability */}
                <div className="absolute inset-0 bg-black/40 z-10"></div>

                {/* Content */}
                <div className="container mx-auto px-4 lg:px-8 text-center relative z-20">
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                        <span className="text-gradient">Bundles</span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
                        Curated wellness bundles designed to save you money while maximizing your health journey.
                    </p>
                </div>

                <button
                    type="button"
                    aria-label="Scroll down"
                    onClick={() => window.scrollTo({ behavior: 'smooth', top: window.innerHeight })}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-30 hover:opacity-90 focus:outline-none"
                >
                    <ChevronDown className="w-8 h-8 text-white/80" />
                </button>
            </section>

            <section className="py-12 relative">
                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <p className="text-sm text-muted-foreground mb-6">
                        Showing {groupedProducts.length} bundle packages
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {groupedProducts.map((group, index) => (
                            <BundleCard key={group[0].id} variants={group} index={index} addToCart={addToCart} />
                        ))}
                    </div>
                </div>
            </section>
            </div>
            <Footer />
        </div>
    );
}

function BundleCard({ variants, index, addToCart }: { variants: Product[]; index: number; addToCart: any }) {
    const [selectedVariant, setSelectedVariant] = useState(variants[0]);
    const [quantity, setQuantity] = useState(1);
    const product = selectedVariant;

    useEffect(() => {
        setSelectedVariant(variants[0]);
    }, [variants]);

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
                "group relative rounded-2xl overflow-hidden transition-all duration-500 h-[500px] shadow-xl hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 animate-fade-in-up border-2 border-primary/30 hover:border-primary",
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
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
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
                {/* No Image Overlay */}
                {!product.image && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <div className="text-6xl font-display font-bold text-gray-300">
                            {product.groupName.charAt(0)}
                        </div>
                    </div>
                )}
            </div>

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            {/* Top badges */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Package className="w-3 h-3" />
                    BUNDLE
                </div>
            </div>

            {/* Product Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col z-20 text-white">
                <h3 className="font-display text-2xl font-bold mb-3 line-clamp-2 tracking-wide leading-tight shadow-black/50 drop-shadow-md">
                    <Link to={`/product/${slugify(product.groupName)}`} className="hover:underline">
                        {product.groupName}
                    </Link>
                </h3>

                <div className="mt-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-3xl font-display font-bold">${product.price.toFixed(2)}</span>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setQuantity(Math.max(1, quantity - 1));
                                }}
                                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold transition-colors"
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>
                            <span className="w-8 text-center font-medium text-sm">{quantity}</span>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setQuantity(Math.min(99, quantity + 1));
                                }}
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
                        onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart();
                        }}
                    >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add Bundle to Cart
                    </Button>
                </div>
            </div>
        </div>
    );
}
