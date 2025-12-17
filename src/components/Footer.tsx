import { Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";

// TikTok icon component (not in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const footerLinks = {
  productLines: [
    { label: "Water Bottles", href: "/shop/water-bottles" },
    { label: "Electrolytes", href: "/shop/electrolytes" },
    { label: "Supplements", href: "/shop/supplements" },

    { label: "Bundles", href: "/shop/bundles" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Mission", href: "/mission" },
    { label: "Our Team", href: "/team" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Shipping", href: "/shipping" },
    { label: "Contact Us", href: "/contact" },
    
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  teamApps: [
    { label: "Team Login", href: "/login" },
    { label: "Email Management", href: "https://thrive-ve.streamlit.app/" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: TikTokIcon, href: "https://tiktok.com", label: "TikTok" },
  { icon: Mail, href: "mailto:contact@thrivewellness.com", label: "Email" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <img src="/Thrive.png" alt="Thrive" className="h-12 w-auto object-contain" />
            </a>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Premium wellness products designed for those who demand more from life.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/20 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Lines */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Product Lines</h4>
            <ul className="space-y-3">
              {footerLinks.productLines.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Team Apps */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Team Apps</h4>
            <ul className="space-y-3">
              {footerLinks.teamApps.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("http") ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Thrive Wellness. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground italic">
              Disclaimer: This Virtual Enterprise online store is for educational purposes only (Thrive 2025-2026)
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              <Link to="/changelog" className="text-xs text-muted-foreground/60 hover:text-muted-foreground underline">
                v1.8.3 - Minor Fixes
              </Link>
            </p>

          </div>
        </div>
      </div>
    </footer>
  );
}
