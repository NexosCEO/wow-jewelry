import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import logoUrl from "@assets/IMG_3548_1761884766204.jpeg";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export function Header({ cartItemCount, onCartClick }: HeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="py-2.5 text-center text-xs uppercase tracking-[0.15em] font-semibold" style={{ background: 'linear-gradient(90deg, var(--rose) 0%, var(--gold) 100%)', color: '#2b211b' }}>
        FREE SHIPPING ON ALL ORDERS
      </div>
      
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2.5">
              <img 
                src={logoUrl} 
                alt="WOW by Dany logo" 
                className="h-11 w-auto cursor-pointer hover:opacity-90 transition-opacity rounded-lg shadow-sm"
                data-testid="link-home"
              />
              <span className="font-serif text-lg md:text-xl font-bold tracking-wide hidden sm:inline" data-testid="text-brand">
                WOW by Dany
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/">
                <span className={`text-sm uppercase tracking-wider cursor-pointer transition-colors hover:text-primary ${location === "/" ? "text-primary font-semibold" : ""}`} data-testid="link-home-nav">
                  Home
                </span>
              </Link>
              <Link href="/">
                <span className={`text-sm uppercase tracking-wider cursor-pointer transition-colors hover:text-primary ${location === "/" ? "text-primary font-semibold" : ""}`} data-testid="link-shop">
                  Shop
                </span>
              </Link>
              <a href="#about">
                <span className="text-sm uppercase tracking-wider cursor-pointer transition-colors hover:text-primary" data-testid="link-about">
                  About
                </span>
              </a>
            </nav>

            <Button
              variant="outline"
              onClick={onCartClick}
              className="relative gap-2 rounded-full font-bold"
              data-testid="button-cart"
            >
              <span className="hidden sm:inline text-sm">Cart</span>
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 h-5.5 w-5.5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--gold)', color: 'var(--warm-charcoal)' }}
                  data-testid="badge-cart-count"
                >
                  {cartItemCount}
                </span>
              )}
            </Button>

            <button 
              className="md:hidden p-2 hover-elevate active-elevate-2 rounded-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <nav className="flex flex-col p-4 space-y-4">
              <Link href="/">
                <span 
                  className={`block py-2 text-base cursor-pointer transition-colors hover:text-primary ${location === "/" ? "text-primary font-semibold" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-home-mobile"
                >
                  Home
                </span>
              </Link>
              <Link href="/">
                <span 
                  className={`block py-2 text-base cursor-pointer transition-colors hover:text-primary ${location === "/" ? "text-primary font-semibold" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-shop-mobile"
                >
                  Shop
                </span>
              </Link>
              <a 
                href="#about"
                className="block py-2 text-base cursor-pointer transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-about-mobile"
              >
                About
              </a>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
