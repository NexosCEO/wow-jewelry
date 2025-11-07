import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { CartItem, Product, CustomBraceletCartItem, CustomNecklaceCartItem } from "@shared/schema";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";

type UnifiedCartItem = CartItem | CustomBraceletCartItem | CustomNecklaceCartItem;
import Home from "@/pages/Home";
import ProductDetail from "@/pages/ProductDetail";
import BraceletBuilder from "@/pages/BraceletBuilder";
import NecklaceBuilder from "@/pages/NecklaceBuilder";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import Admin from "@/pages/Admin";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import NotFound from "@/pages/not-found";
import { useToast } from "@/hooks/use-toast";

function Router() {
  const [cart, setCart] = useState<UnifiedCartItem[]>(() => {
    const saved = localStorage.getItem("wow-cart");
    if (!saved) return [];
    
    try {
      const parsed = JSON.parse(saved);
      const sanitized = parsed.filter((item: any) => {
        if ("product" in item && item.product && item.product.id) {
          return true;
        }
        if ("configId" in item && item.configId) {
          return true;
        }
        console.warn("Removing corrupted cart item:", item);
        return false;
      });
      return sanitized;
    } catch (e) {
      console.error("Failed to parse cart from localStorage:", e);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("wow-cart", JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (item: Product | CustomBraceletCartItem | CustomNecklaceCartItem) => {
    setCart((prev) => {
      if ("type" in item && item.type === "custom-bracelet") {
        const customItem = item as CustomBraceletCartItem;
        toast({
          title: "Added to Cart",
          description: "Your custom bracelet has been added to cart!",
          duration: 2000,
        });
        return [...prev, { ...customItem, quantity: 1 }];
      } else if ("type" in item && item.type === "custom-necklace") {
        const customItem = item as CustomNecklaceCartItem;
        toast({
          title: "Added to Cart",
          description: "Your custom necklace has been added to cart!",
          duration: 2000,
        });
        return [...prev, { ...customItem, quantity: 1 }];
      } else {
        const product = item as Product;
        const existing = prev.find((cartItem) => 
          "product" in cartItem && cartItem.product.id === product.id
        );
        if (existing && "product" in existing) {
          toast({
            title: "Cart Updated",
            description: `${product.name} quantity increased`,
            duration: 2000,
          });
          return prev.map((cartItem) =>
            "product" in cartItem && cartItem.product.id === product.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        }
        toast({
          title: "Added to Cart",
          description: `${product.name} has been added to your cart`,
          duration: 2000,
        });
        return [...prev, { product, quantity: 1 } as CartItem];
      }
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => {
        if ("product" in item && item.product.id === itemId) {
          return { ...item, quantity };
        } else if ("configId" in item && item.configId === itemId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (itemId: string) => {
    console.log("Removing item with ID:", itemId);
    setCart((prev) => {
      console.log("Current cart:", prev);
      const newCart = prev.filter((item) => {
        if ("product" in item) {
          console.log("Product item:", item.product.id, "Match:", item.product.id === itemId);
          return item.product.id !== itemId;
        }
        if ("configId" in item) {
          console.log("Custom item:", item.configId, "Match:", item.configId === itemId);
          return item.configId !== itemId;
        }
        return true;
      });
      console.log("New cart after filter:", newCart);
      return newCart;
    });
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart",
    });
  };

  const handleClearCart = () => {
    setCart([]);
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart",
    });
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen">
      <Header cartItemCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} />
      
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      <Switch>
        <Route path="/" component={() => <Home onAddToCart={handleAddToCart} />} />
        <Route path="/product/:id" component={() => <ProductDetail onAddToCart={handleAddToCart} />} />
        <Route path="/bracelet-builder" component={() => <BraceletBuilder onAddToCart={handleAddToCart} />} />
        {/* COLD STORAGE: Necklace builder disabled per client request - can be re-enabled in future */}
        {/* <Route path="/necklace-builder" component={() => <NecklaceBuilder onAddToCart={handleAddToCart} />} /> */}
        <Route path="/checkout" component={() => <Checkout cart={cart} onClearCart={handleClearCart} />} />
        <Route path="/orders" component={Orders} />
        <Route path="/admin" component={Admin} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route component={NotFound} />
      </Switch>

      <footer className="bg-card border-t border-border py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-serif text-xl font-bold mb-4">WOW Jewelry</h3>
              <p className="text-sm text-muted-foreground">
                Handcrafted jewelry made with love and attention to detail.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/" className="hover:text-primary transition-colors">Shop</a></li>
                <li><a href="/orders" className="hover:text-primary transition-colors">Orders</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-muted-foreground">
                <a 
                  href="mailto:jewelryboutiquewow@gmail.com" 
                  className="hover:text-primary transition-colors"
                  data-testid="link-email"
                >
                  jewelryboutiquewow@gmail.com
                </a>
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} WOW Jewelry. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
