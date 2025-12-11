import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { PageLoader } from "@/components/PageLoader";
import { ScrollToTop } from "@/components/ScrollToTop";
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
import CheckoutLoading from "./pages/CheckoutLoading";
import CheckoutManual from "./pages/CheckoutManual";
import CheckoutProcessing from "./pages/CheckoutProcessing";
import Newsletter from "./pages/Newsletter";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Shipping from "./pages/Shipping";
import Mission from "./pages/Mission";
import Team from "./pages/Team";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/ve-wellness-blue">
          <ScrollToTop />
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
            <Route path="/checkout-loading" element={<CheckoutLoading />} />
            <Route path="/checkout-manual" element={<CheckoutManual />} />
            <Route path="/checkout-processing" element={<CheckoutProcessing />} />
            <Route path="/about" element={<About />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/team" element={<Team />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
