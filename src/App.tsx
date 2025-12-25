import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/PageLoader";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingCart } from "@/components/FloatingCart";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Stories from "./pages/Stories";
import Team from "./pages/Team";
import ProductManagement from "./pages/ProductManagement";
import Login from "./pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProductDetail from "./pages/ProductDetail";
import Featured from "./pages/Featured";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import WaterBottles from "./pages/WaterBottles";
import Supplements from "./pages/Supplements";

import Bundles from "./pages/Bundles";
import Cart from "./pages/Cart";
import Changelog from "./pages/Changelog";
import CheckoutLoading from "./pages/CheckoutLoading";
import CheckoutManual from "./pages/CheckoutManual";
import CheckoutProcessing from "./pages/CheckoutProcessing";
import Newsletter from "./pages/Newsletter";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Shipping from "./pages/Shipping";
import Mission from "./pages/Mission";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
              <ScrollToTop />
              <PageLoader />
              <ChatbotWidget />
              <FloatingCart />
              <NewsletterPopup />
              <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/featured" element={<Featured />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/water-bottles" element={<WaterBottles />} />
            <Route path="/shop/supplements" element={<Supplements />} />

            <Route path="/shop/bundles" element={<Bundles />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/changelog" element={<Changelog />} />
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
            <Route path="/product-management" element={
              <ProtectedRoute>
                <ProductManagement />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
