import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { products, Product } from "@/data/products";
import { useProductsCsv } from "@/hooks/useProductsCsv";
import { ShoppingBag, ShoppingCart, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";

export default function WaterBottlesPage() {
    const { addToCart } = useCart();
    const { products: csvProducts } = useProductsCsv();
    const sourceProducts = csvProducts.length ? csvProducts : products;

    const waterBottleProducts = useMemo(() => {
        return sourceProducts.filter((product) => product.category === "Water Bottles");
    }, [sourceProducts]);

    // Group products by groupName, but split groups with <5 variants into individual products
    const groupedProducts = useMemo(() => {
        const groups: { [key: string]: Product[] } = {};

        waterBottleProducts.forEach(product => {
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
    }, [waterBottleProducts]);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="relative">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Image Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-sky-500/20 to-background"></div>
                    <div className="absolute inset-0 matrix-dots opacity-10" aria-hidden="true"></div>
                </div>
                
                {/* Darker overlay for text readability */}
                <div className="absolute inset-0 bg-black/40 z-10"></div>

                {/* Content */}
                <div className="container mx-auto px-4 lg:px-8 text-center relative z-20">
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                        Water <span className="text-gradient">Bottles</span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
                        Premium insulated water bottles designed to keep your drinks at the perfect temperature.
                    </p>
                </div>
                {/* Scroll-down indicator at true hero bottom, outside .container */}
                <button
                    type="button"
                    aria-label="Scroll down"
                    onClick={() => window.scrollTo({ behavior: 'smooth', top: window.innerHeight })}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-30 hover:opacity-90 focus:outline-none"
                >
                    <ChevronDown className="w-8 h-8 text-white/80" />
                </button>
            </section>

            {/* Products Grid */}
            <section className="py-12 relative">
                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <p className="text-sm text-muted-foreground mb-6">
                        Showing {groupedProducts.length} water bottle collections
                    </p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {groupedProducts.map((group, index) => (
                            ["The Glacier", "The Iceberg"].includes(group[0].groupName)
                                ? <FeatureWaterBottleCard key={group[0].id} variant={group[0]} addToCart={addToCart} />
                                : <ProductCard key={group[0].id} variants={group} index={index} addToCart={addToCart} />
                        ))}
                    </div>
                </div>
            </section>

            </div>
            <Footer />
        </div>
    );
}

function ProductCard({ variants, index, addToCart }: { variants: Product[]; index: number; addToCart: any }) {
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

    const getCategoryColor = (category: string) => {
        return "bg-sky-500/10 text-sky-600";
    };

    return (
        <div
            className={cn(
                "group relative rounded-2xl overflow-hidden transition-all duration-500 h-[500px] shadow-xl hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-2 animate-fade-in-up border border-border/50",
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
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
                <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md bg-white/90 text-sky-600"
                )}>
                    Water Bottles
                </span>
            </div>

            {/* Product Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col z-20 text-white">
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
                        Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    );
}

function FeatureWaterBottleCard({ variant, addToCart }) {
    // modern, edge-to-edge, visually striking card for Apple-style product highlight
    const oz = variant.groupName === "The Glacier" ? "40 oz" : variant.groupName === "The Iceberg" ? "32 oz" : "";
    return (
        <div className="relative col-span-2 xl:col-span-3 flex flex-col md:flex-row items-center justify-center min-h-[400px] md:min-h-[340px] bg-gradient-to-br from-navy-medium/90 via-background to-white/30 border border-glacier rounded-3xl shadow-2xl overflow-hidden px-0 py-8 animate-fade-in-up">
            <div className="relative flex-1 w-full h-80 md:h-full flex items-center justify-center p-4"><img src={variant.image} alt={variant.name} loading="lazy" className="object-contain w-full max-w-xs md:max-w-md drop-shadow-2xl mx-auto select-none" draggable={false} /></div>
            <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left px-4 md:px-10 py-6 gap-4">
                <span className="inline-block bg-white/80 text-glacier font-bold px-6 py-1 rounded-full shadow text-base tracking-wider mb-2 uppercase letter-spacing-tight">{oz}</span>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-navy-900 drop-shadow">{variant.groupName}</h2>
                <p className="mt-2 text-lg text-navy-800/90 font-medium">Premium insulated water bottle. Modern design. Lifetime durability.</p>
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                    <Button
                        size="xl"
                        className="bg-glacier text-white text-lg font-extrabold px-12 py-4 shadow-lg hover:shadow-glacier/40 hover:bg-glacier/90 rounded-full min-w-[170px] transition-all"
                        onClick={() => addToCart({
                            name: variant.name,
                            link: variant.buyLink,
                            price: variant.price,
                            image: variant.image,
                        })}
                    >
                        Add to Cart – ${variant.price.toFixed(2)}
                    </Button>
                </div>
            </div>
        </div>
    );
}
