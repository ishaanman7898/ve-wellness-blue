import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  {
    label: "Products",
    href: "/shop",
    hasDropdown: true,
    dropdownItems: [
      { label: "Water Bottles", href: "/shop/water-bottles" },
      { label: "Electrolytes", href: "/shop/electrolytes" },
      { label: "Supplements", href: "/shop/supplements" },
      { label: "Accessories", href: "/shop/accessories" },
      { label: "Bundles", href: "/shop/bundles" },
      { label: "All Products", href: "/shop" },
    ]
  },
  { label: "About", href: "/about" },
  { label: "Stories", href: "/stories" },
  { label: "Newsletter", href: "#newsletter" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cart } = useCart();
  const totalItems = cart.length;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          isScrolled 
            ? "py-2 mx-auto px-4 lg:px-8" 
            : "py-4"
        )}
      >
        <div className={cn(
          "container mx-auto px-4 lg:px-8 transition-all duration-300",
          isScrolled && "bg-black/90 backdrop-blur-xl rounded-full py-3 mt-2"
        )}>
          <div className="flex items-center justify-between relative">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 group flex-shrink-0">
              <img 
                src="/Thrive.png" 
                alt="Thrive" 
                className={cn(
                  "w-auto object-contain drop-shadow transition-all duration-300",
                  isScrolled ? "h-10 md:h-12" : "h-16 md:h-20"
                )} 
              />
            </a>

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <a
                    href={link.href}
                    className="flex items-center gap-1 px-4 py-2 text-white/90 hover:text-white transition-colors font-medium drop-shadow-sm hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]"
                  >
                    {link.label}
                    {link.hasDropdown && (
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        activeDropdown === link.label && "rotate-180"
                      )} />
                    )}
                  </a>

                  {/* Dropdown */}
                  {link.hasDropdown && activeDropdown === link.label && (
                    <div className="absolute top-full left-0 pt-2 animate-fade-in">
                      <div className="glass rounded-xl p-2 min-w-[200px] shadow-elevated">
                        {link.dropdownItems?.map((item) => (
                          <a
                            key={item.label}
                            href={item.href}
                            className="block px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            {item.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side Actions - Cart Button */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="nav-cta" className="rounded-full group relative" asChild>
                <Link to="/cart">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="ml-2">Cart</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden glass mt-2 mx-4 rounded-xl p-4 animate-scale-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-3 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors font-medium drop-shadow-sm hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-border my-2" />
              <Button variant="nav-cta" className="w-full rounded-full group relative" asChild>
                <Link to="/cart">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="ml-2">Cart</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
