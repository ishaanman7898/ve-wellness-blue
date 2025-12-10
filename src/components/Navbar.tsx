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
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={cn(
          "fixed top-0 z-50 w-full transition-[padding,background-color] duration-500 ease-out",
          isScrolled ? "py-2" : "py-5"
        )}
      >
        <div className={cn(
          "container mx-auto px-6 lg:px-10 transition-all duration-500 ease-out"
        )}
        >
          <div
            className={cn(
              "relative mx-auto mt-2 transition-[max-width,background-color,backdrop-filter,border-radius,padding] duration-500 ease-out",
              isScrolled
                ? "max-w-[min(82vw,1100px)] bg-black/90 backdrop-blur-xl rounded-full px-8 md:px-10 lg:px-12 xl:px-16 py-4"
                : "max-w-[min(96vw,1500px)] bg-transparent px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-6"
            )}
          >
            <div className="flex items-center justify-between relative">
              {/* Logo */}
              <a href="/" className="flex items-center gap-3 group flex-shrink-0">
                <img
                  src="/thrive.png"
                  alt="Thrive"
                  className={cn(
                    "w-auto object-contain drop-shadow transition-transform duration-500 origin-left",
                    "h-20 md:h-24 lg:h-28",
                    isScrolled ? "scale-75" : "scale-110"
                  )}
                />
              </a>

              {/* Desktop Navigation - Centered */}
              <div className="hidden lg:flex items-center gap-4 absolute left-1/2 -translate-x-1/2">
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
                        "flex items-center gap-1 px-4 py-2 text-white font-medium transition-colors duration-200",
                        "hover:text-ocean"
                      )}
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
                        <div
                          className={cn(
                            "rounded-xl p-2 min-w-[220px] border border-border transition-colors",
                            isScrolled
                              ? "bg-black/90 backdrop-blur-xl"
                              : "bg-black/90 backdrop-blur-xl"
                          )}
                        >
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

              {/* Right Side Actions - Cart & Shop */}
              <div className="hidden lg:flex items-center gap-4">
                {/* Cart Icon */}
                <Link to="/cart" className="relative group text-white hover:text-ocean transition-colors">
                  <ShoppingCart className="w-6 h-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>

                {/* Shop Button */}
                <Button variant="nav-cta" className="rounded-full px-6 group relative hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:shadow-blue-500/50 transition-all duration-300" asChild>
                  <Link to="/shop">
                    Shop
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
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden glass mt-2 mx-4 rounded-xl p-4 animate-scale-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-3 rounded-lg text-white font-medium transition-colors duration-200 hover:text-ocean"
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
