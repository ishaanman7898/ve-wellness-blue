import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { FloatingCart } from "@/components/FloatingCart";
import { PageLoader } from "@/components/PageLoader";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import NotFound from "./pages/NotFound";

import About from "./pages/About";
import Stories from "./pages/Stories";

import Login from "./pages/Login";
import Admin from "./pages/Admin";
import ProductDetail from "./pages/ProductDetail";
import CartTest from "./pages/CartTest";
import Featured from "./pages/Featured";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import WaterBottles from "./pages/WaterBottles";
import Electrolytes from "./pages/Electrolytes";
import Supplements from "./pages/Supplements";
import Accessories from "./pages/Accessories";
import Bundles from "./pages/Bundles";
import Cart from "./pages/Cart";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageLoader />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/featured" element={<Featured />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/water-bottles" element={<WaterBottles />} />
            <Route path="/shop/electrolytes" element={<Electrolytes />} />
            <Route path="/shop/supplements" element={<Supplements />} />
            <Route path="/shop/accessories" element={<Accessories />} />
            <Route path="/shop/bundles" element={<Bundles />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart-test" element={<CartTest />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingCart />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
