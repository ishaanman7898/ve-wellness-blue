import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Check, ExternalLink, Loader2, X } from "lucide-react";

export default function CheckoutProcessing() {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"processing" | "complete" | "error">("processing");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [progress, setProgress] = useState({ processed: 0, total: 0 });
    const [finalCartUrl, setFinalCartUrl] = useState<string | null>(null);
    const hasStarted = useRef(false);

    // Cart server URL
    const CART_SERVER_URL = import.meta.env.VITE_CART_SERVER_URL || "http://localhost:3001";

    const startCheckout = async () => {
        try {
            // Flatten cart items based on quantity
            const items = cart.flatMap(item =>
                Array((item.quantity || 1)).fill({ name: item.name, url: item.link })
            );

            if (items.length === 0) {
                navigate("/cart");
                return;
            }

            setProgress({ processed: 0, total: items.length });

            const response = await fetch(`${CART_SERVER_URL}/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });

            if (!response.ok) throw new Error("Failed to start checkout");

            const data = await response.json();
            setSessionId(data.sessionId);
            pollStatus(data.sessionId);
        } catch (error) {
            console.error("Checkout error:", error);
            setStatus("error");
        }
    };

    useEffect(() => {
        // Prevent double execution
        if (hasStarted.current) return;
        hasStarted.current = true;

        if (cart.length === 0 && !sessionId) {
            navigate("/cart");
            return;
        }

        if (cart.length > 0 && !sessionId) {
            startCheckout();
        }
    }, [cart, navigate, sessionId, CART_SERVER_URL]);

    const pollStatus = async (sid: string) => {
        const checkStatus = async () => {
            try {
                const response = await fetch(`${CART_SERVER_URL}/checkout/status/${sid}`);
                if (response.ok) {
                    const data = await response.json();
                    setProgress({ processed: data.processedItems, total: data.totalItems });

                    if (data.status === "complete") {
                        setStatus("complete");
                        setFinalCartUrl(data.finalCartUrl);
                        clearCart();
                        return true; // Stop polling
                    } else if (data.status === "error") {
                        setStatus("error");
                        return true; // Stop polling
                    }
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
            return false;
        };

        const interval = setInterval(async () => {
            const done = await checkStatus();
            if (done) {
                clearInterval(interval);
            }
        }, 1000);

        // Initial check
        checkStatus();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-background overflow-auto flex items-center justify-start pl-12 md:pl-24">
            {/* Close Button */}
            <button
                onClick={() => navigate("/cart")}
                className="absolute top-6 right-6 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="max-w-md w-full p-8">
                <div className="flex flex-col items-start justify-center text-left">
                    {status === "processing" && (
                        <>
                            {/* Animated Spinner */}
                            <div className="relative mb-8">
                                <div className="relative">
                                    <div className="h-28 w-28 animate-spin rounded-full border-4 border-glacier/20 border-t-glacier"></div>
                                    <div className="absolute inset-0 m-auto h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-glacier/20 blur-xl animate-pulse"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShoppingCart className="w-12 h-12 text-glacier" />
                                    </div>
                                </div>
                            </div>

                            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-glacier bg-clip-text text-transparent">
                                Building Your Cart
                            </h1>

                            <p className="text-muted-foreground text-lg mb-6">
                                Adding items to the official VEI cart...
                            </p>

                            {/* Progress indicator */}
                            <div className="flex items-center justify-start gap-2 text-sm text-muted-foreground mb-6">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>
                                    Processing item {progress.processed} of {progress.total}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-muted rounded-full h-3 overflow-hidden mb-8">
                                <div
                                    className="h-full bg-gradient-to-r from-glacier to-primary transition-all duration-500"
                                    style={{ width: `${progress.total > 0 ? (progress.processed / progress.total) * 100 : 0}%` }}
                                ></div>
                            </div>

                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">A browser window has opened.</span><br />
                                    Please keep it open while we add your items.
                                </p>
                            </div>
                        </>
                    )}

                    {status === "complete" && (
                        <>
                            <div className="relative mb-8">
                                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-emerald-500 to-glacier flex items-center justify-center animate-in zoom-in duration-300">
                                    <Check className="w-14 h-14 text-white" />
                                </div>
                            </div>

                            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-emerald-500">
                                Your Cart is Ready!
                            </h1>

                            <p className="text-muted-foreground text-lg mb-8">
                                All items have been added. Complete your purchase in the opened window.
                            </p>

                            <div className="space-y-4 w-full">
                                {finalCartUrl && (
                                    <Button
                                        variant="hero"
                                        size="lg"
                                        className="w-full rounded-full"
                                        onClick={() => window.open(finalCartUrl, "_blank")}
                                    >
                                        <ExternalLink className="w-5 h-5 mr-2" />
                                        Open Cart
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/shop")}
                                    className="w-full rounded-full"
                                >
                                    Continue Shopping
                                </Button>
                            </div>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="h-28 w-28 mb-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                <span className="text-5xl">❌</span>
                            </div>

                            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-red-500">
                                Something Went Wrong
                            </h1>

                            <p className="text-muted-foreground text-lg mb-8">
                                We couldn't complete the automated checkout. Please try again or use the manual checkout.
                            </p>

                            <div className="space-x-4">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/cart")}
                                    className="rounded-full"
                                >
                                    Back to Cart
                                </Button>
                                <Button
                                    onClick={() => {
                                        hasStarted.current = false;
                                        setStatus("processing");
                                        startCheckout(); // Retry
                                    }}
                                    className="rounded-full"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
