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
      { label: "Supplements", href: "/shop/supplements" },

      { label: "Bundles", href: "/shop/bundles" },
      { label: "All Products", href: "/shop" },
    ]
  },
  {
    label: "Company",
    href: "/about",
    hasDropdown: true,
    dropdownItems: [
      { label: "About Us", href: "/about" },
      { label: "Our Mission", href: "/mission" },
      { label: "Our Team", href: "/team" },
      { label: "Newsletter", href: "/newsletter" },
    ]
  },
  {
    label: "Support",
    href: "/faq",
    hasDropdown: true,
    dropdownItems: [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping", href: "/shipping" },
      { label: "Contact Us", href: "/contact" },
    ]
  },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { cart } = useCart();
  const totalItems = cart.length;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const onScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsScrolled(window.scrollY > 10), 16);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={cn(
          "fixed top-0 z-50 w-full navbar-adaptive transition-all duration-300 ease-in-out",
          isScrolled ? "py-2" : "py-6 sm:py-7"
        )}
      >
        <div className={cn(
          "container mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 navbar-adaptive"
        )}
        >
          <div
            className={cn(
              "relative mx-auto mt-2 navbar-adaptive transition-all duration-300 ease-in-out",
              isScrolled
                ? "max-w-[min(82vw,1100px)] bg-black/90 backdrop-blur-xl rounded-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2"
                : "max-w-[min(96vw,1500px)] bg-transparent px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-3 sm:py-4"
            )}
          >
            <div className="flex items-center justify-between relative">
              {/* Logo */}
              <a href="/" className="flex items-center gap-3 group flex-shrink-0">
                <img
                  src="/Thrive.png"
                  alt="Thrive"
                  className={cn(
                    "w-auto object-contain drop-shadow navbar-adaptive origin-left transition-all duration-300 ease-in-out",
                    "h-16 sm:h-18 md:h-20 lg:h-24 xl:h-28",
                    isScrolled ? "scale-75" : "scale-100"
                  )}
                />
              </a>

              {/* Desktop Navigation - Centered */}
              <div className="hidden lg:flex items-center gap-2 sm:gap-3 md:gap-4 absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-in-out">
                {navLinks.map((link) => (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <a
                      href={link.href}
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 font-medium transition-all duration-300 hover-lift",
                        "text-white hover:text-[#31C2F4]",
                        isScrolled && "px-2 py-1 text-sm"
                      )}
                    >
                      {link.label}
                      {link.hasDropdown && (
                        <ChevronDown className={cn(
                          "w-4 h-4 navbar-adaptive transition-all duration-300",
                          activeDropdown === link.label && "rotate-180",
                          isScrolled && "w-3 h-3"
                        )} />
                      )}
                    </a>

                    {/* Dropdown */}
                    {link.hasDropdown && activeDropdown === link.label && (
                      <div className="absolute top-full left-0 pt-2">
                        <div
                          className={cn(
                            "rounded-xl p-2 min-w-[220px] border border-border dropdown-enhanced",
                            "bg-black/90 backdrop-blur-xl"
                          )}
                        >
                          {link.dropdownItems?.map((item) => (
                            <a
                              key={item.label}
                              href={item.href}
                              className="block px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 hover-lift"
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

              {/* Right Side Actions - Cart & Shop */}
              <div className="hidden lg:flex items-center gap-2 sm:gap-3 md:gap-4 transition-all duration-300 ease-in-out">
                {/* Cart Icon */}
                <Link to="/cart" className="relative group text-white hover:text-[#31C2F4] transition-all duration-300 hover-lift">
                  <ShoppingCart className={cn(
                    "transition-all duration-300 ease-in-out",
                    isScrolled ? "w-5 h-5" : "w-6 h-6"
                  )} />
                  {totalItems > 0 && (
                    <span className={cn(
                      "absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300",
                      isScrolled ? "w-4 h-4 text-[10px]" : "w-5 h-5"
                    )}>
                      {totalItems}
                    </span>
                  )}
                </Link>

                {/* Divider */}
                <div className={cn(
                  "w-px bg-white/20 transition-all duration-300",
                  isScrolled ? "h-4" : "h-6"
                )}></div>

                {/* Shop Button */}
                <Button variant="nav-cta" className={cn(
                  "rounded-full px-4 sm:px-6 group relative hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:shadow-blue-500/50 transition-all duration-500 hover-lift",
                  isScrolled ? "px-3 py-1 text-sm" : "px-4 sm:px-6 py-2"
                )} asChild>
                  <Link to="/shop">
                    Shop
                  </Link>
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden glass bg-black/90 mt-2 mx-4 rounded-xl p-4 animate-scale-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-3 rounded-lg text-white font-medium transition-colors duration-200 hover:text-[#31C2F4]"
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
