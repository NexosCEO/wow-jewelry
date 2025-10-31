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
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-medium tracking-wide">
        FREE SHIPPING ON ALL ORDERS
      </div>
      
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20 md:h-24">
            <button 
              className="md:hidden p-2 hover-elevate active-elevate-2 rounded-md"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/">
              <img 
                src={logoUrl} 
                alt="WOW Jewelry" 
                className="h-10 md:h-12 w-auto cursor-pointer hover:opacity-90 transition-opacity"
                data-testid="link-home"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/">
                <span className={`text-sm uppercase tracking-wider cursor-pointer transition-colors hover:text-primary ${location === "/" ? "text-primary font-semibold" : ""}`} data-testid="link-shop">
                  Shop
                </span>
              </Link>
              <Link href="/orders">
                <span className={`text-sm uppercase tracking-wider cursor-pointer transition-colors hover:text-primary ${location === "/orders" ? "text-primary font-semibold" : ""}`} data-testid="link-orders">
                  Orders
                </span>
              </Link>
            </nav>

            <Button
              variant="ghost"
              size="icon"
              onClick={onCartClick}
              className="relative"
              data-testid="button-cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-cart-count"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <nav className="flex flex-col p-4 space-y-4">
              <Link href="/">
                <span 
                  className={`block py-2 text-base cursor-pointer transition-colors hover:text-primary ${location === "/" ? "text-primary font-semibold" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-shop-mobile"
                >
                  Shop
                </span>
              </Link>
              <Link href="/orders">
                <span 
                  className={`block py-2 text-base cursor-pointer transition-colors hover:text-primary ${location === "/orders" ? "text-primary font-semibold" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-orders-mobile"
                >
                  Orders
                </span>
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
