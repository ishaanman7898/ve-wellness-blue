import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Trash2, ShoppingBag, Truck, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, addToCart } = useCart();
  const navigate = useNavigate();
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  const shippingOptions = [
    {
      value: 'standard',
      label: 'Standard Shipping',
      description: '5-7 business days',
      price: 0,
      icon: Truck,
      badge: 'Free'
    },
    {
      value: 'express',
      label: 'Express Shipping',
      description: '2-3 business days',
      price: 10,
      icon: Zap,
      badge: '+$10.00'
    }
  ];

  const selectedShipping = shippingOptions.find(option => option.value === shippingMethod);

  const handleCheckout = () => {
    // If express shipping is selected, add the express shipping "product" to the cart
    if (shippingMethod === 'express') {
      addToCart({
        name: "Express Shipping",
        link: "https://portal.veinternational.org/buybuttons/us019814/btn/express-shipping-expr/",
        price: 10.00,
        image: "", // No image for shipping
        quantity: 1
      }, 1);
    }

    // Proceed to checkout page
    navigate("/checkout-processing");
  };

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

                    {/* Shipping Selection */}
                    <div className="space-y-3 pt-2">
                      <label className="text-sm font-medium">Shipping Method</label>
                      
                      <div className="space-y-2">
                        {shippingOptions.map((option) => {
                          const Icon = option.icon;
                          const isSelected = shippingMethod === option.value;
                          return (
                            <button
                              key={option.value}
                              onClick={() => setShippingMethod(option.value as 'standard' | 'express')}
                              className={cn(
                                "w-full p-4 rounded-xl border transition-all duration-200 text-left",
                                isSelected 
                                  ? "border-primary bg-primary/5 shadow-sm" 
                                  : "border-border hover:border-primary/50 hover:bg-white/5"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <Icon className={cn(
                                  "w-5 h-5 mt-0.5 flex-shrink-0",
                                  isSelected ? "text-primary" : "text-muted-foreground"
                                )} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={cn(
                                      "font-medium",
                                      isSelected ? "text-primary" : ""
                                    )}>
                                      {option.label}
                                    </span>
                                    <Badge 
                                      variant={option.price === 0 ? "secondary" : "outline"} 
                                      className={cn(
                                        "text-xs font-medium",
                                        option.price === 0 ? "bg-green-100 text-green-800 border-green-200" : ""
                                      )}
                                    >
                                      {option.badge}
                                    </Badge>
                                  </div>
                                  <div className={cn(
                                    "text-sm",
                                    isSelected ? "text-primary/80" : "text-muted-foreground"
                                  )}>
                                    {option.description}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 mt-2">
                        <selectedShipping.icon className="w-4 h-4" />
                        <span>Estimated delivery: {selectedShipping.description}</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-muted-foreground pt-2">
                      <span>Shipping Cost</span>
                      <span>{selectedShipping?.price === 0 ? 'Free' : `$${selectedShipping?.price.toFixed(2)}`}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">${(totalPrice + (selectedShipping?.price || 0)).toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    variant="hero"
                    className="w-full rounded-full"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>

                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Taxes calculated at checkout
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer removed from cart page */}
    </div>
  );
}
