import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Trash2, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-44 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8">
            {/* Continue Shopping button removed */}
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">Your Cart</h1>

          {cart.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/50 mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
              <Button variant="hero" asChild>
                <Link to="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item, index) => {
                  const qty = item.quantity || 1;
                  const unit = item.price || 0;
                  const line = unit * qty;
                  return (
                    <div
                      key={index}
                      className="glass rounded-xl p-4 md:p-6 flex flex-col sm:flex-row gap-4"
                    >
                      {/* Product Image Placeholder */}
                      <div className="w-full sm:w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg truncate">{item.name}{qty > 1 ? ` × ${qty}` : ''}</h3>
                          <p className="text-muted-foreground text-sm">Unit: ${unit.toFixed(2)}</p>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center justify-start sm:justify-center gap-2">
                          <button
                            onClick={() => updateQuantity(index, Math.max(0, qty - 1))}
                            className="px-3 py-2 rounded-lg border border-border hover:bg-white/10"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={qty}
                            onChange={(e) => updateQuantity(index, Math.max(0, parseInt(e.target.value || '0', 10)))}
                            className="w-14 text-center bg-transparent border border-border rounded-lg py-2"
                          />
                          <button
                            onClick={() => updateQuantity(index, qty + 1)}
                            className="px-3 py-2 rounded-lg border border-border hover:bg-white/10"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Line Price + Remove */}
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <div className="text-right">
                            <div className="text-primary font-bold">${line.toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="glass rounded-xl p-6 sticky top-32">
                  <h2 className="font-display text-xl font-bold mb-6">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    variant="hero"
                    className="w-full rounded-full"
                    onClick={() => navigate("/checkout-processing")}
                  >
                    Proceed to Checkout
                  </Button>

                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Taxes and shipping calculated at checkout
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
