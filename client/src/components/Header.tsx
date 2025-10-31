import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import logoUrl from "@assets/IMG_6918_1761884520979.png";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export function Header({ cartItemCount, onCartClick }: HeaderProps) {
  return (
    <>
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-medium tracking-wide">
        FREE SHIPPING ON ALL ORDERS
      </div>
      
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <Link href="/">
          <div className="relative w-full h-24 md:h-32 cursor-pointer" data-testid="link-home">
            <img 
              src={logoUrl} 
              alt="WOW Jewelry" 
              className="w-full h-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                onCartClick();
              }}
              className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8"
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
        </Link>
      </header>
    </>
  );
}
