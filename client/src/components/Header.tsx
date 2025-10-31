import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export function Header({ cartItemCount, onCartClick }: HeaderProps) {
  const [location] = useLocation();
  
  return (
    <>
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-medium tracking-wide">
        FREE SHIPPING ON ALL ORDERS
      </div>
      
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="font-serif text-3xl font-bold cursor-pointer hover:text-primary transition-colors" data-testid="link-home">
                WOW
              </h1>
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
      </header>
    </>
  );
}
