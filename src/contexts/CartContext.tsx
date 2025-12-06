import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface CartItem {
    name: string;
    link: string;
    price?: number;
    image?: string;
    quantity?: number; // default 1
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem, quantity?: number) => void;
    removeFromCart: (index: number) => void;
    updateQuantity: (index: number, quantity: number) => void;
    clearCart: () => void;
    isCheckingOut: boolean;
    checkout: () => Promise<void>;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "veCart";

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Load cart from localStorage on mount and merge duplicates into quantities
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            const arr: CartItem[] = Array.isArray(saved) ? saved : [];
            // Normalize: convert legacy repeated items into aggregated by link
            const map = new Map<string, CartItem>();
            for (const it of arr) {
                const key = it.link;
                const existing = map.get(key);
                if (existing) {
                    existing.quantity = (existing.quantity || 1) + (it.quantity || 1);
                } else {
                    map.set(key, { ...it, quantity: it.quantity || 1 });
                }
            }
            setCart(Array.from(map.values()));
        } catch {
            setCart([]);
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: CartItem, quantity: number = 1) => {
        setCart((prev) => {
            const idx = prev.findIndex((p) => p.link === item.link);
            if (idx !== -1) {
                const next = [...prev];
                next[idx] = { ...next[idx], quantity: (next[idx].quantity || 1) + quantity };
                return next;
            }
            return [...prev, { ...item, quantity }];
        });
    };

    const removeFromCart = (index: number) => {
        setCart((prev) => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => {
        setCart([]);
    };

    const updateQuantity = (index: number, quantity: number) => {
        setCart((prev) => {
            const next = [...prev];
            if (quantity <= 0) {
                return next.filter((_, i) => i !== index);
            }
            if (next[index]) next[index] = { ...next[index], quantity };
            return next;
        });
    };

    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

    const checkout = async () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        setIsCheckingOut(true);

        // Flatten cart items based on quantity
        const items = cart.flatMap(item =>
            Array(item.quantity || 1).fill({ name: item.name, url: item.link })
        );

        try {
            const response = await fetch("http://localhost:3000/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ items }),
            });

            if (!response.ok) {
                throw new Error("Failed to start checkout process");
            }

            // The server responds immediately, but the process continues in the background.
            // We can keep the loading state for a bit or just finish.
            // Since the server opens the browser, we can probably just reset the state.

            // Optional: Wait a bit to show the "Processing" UI
            await new Promise(resolve => setTimeout(resolve, 2000));

            setIsCheckingOut(false);
            // clearCart(); // Optional: clear cart after successful handoff? User might want to keep it if it fails.

        } catch (error) {
            console.error("Checkout error:", error);
            alert("Failed to connect to the checkout helper. Make sure the helper app is running.");
            setIsCheckingOut(false);
        }
    };

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, isCheckingOut, checkout, totalItems, totalPrice }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
