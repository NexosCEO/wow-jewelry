import { CartItem } from "@shared/schema";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem }: CartDrawerProps) {
  const [, setLocation] = useLocation();
  
  const subtotal = cart.reduce((sum, item) => 
    sum + parseFloat(item.product.price) * item.quantity, 0
  );

  const handleCheckout = () => {
    onClose();
    setLocation("/checkout");
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" 
        onClick={onClose}
        data-testid="overlay-cart"
      />
      
      <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-background border-l border-border z-50 shadow-xl" data-testid="drawer-cart">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="font-serif text-2xl font-semibold">Shopping Cart</h2>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-cart">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-muted-foreground mb-4" data-testid="text-empty-cart">Your cart is empty</p>
              <Button onClick={onClose} data-testid="button-continue-shopping">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4" data-testid={`cart-item-${item.product.id}`}>
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-md border border-card-border"
                        data-testid={`img-cart-${item.product.id}`}
                      />
                      
                      <div className="flex-1 space-y-2">
                        <h3 className="font-medium" data-testid={`text-cart-name-${item.product.id}`}>{item.product.name}</h3>
                        <p className="text-sm font-semibold" data-testid={`text-cart-price-${item.product.id}`}>
                          ${parseFloat(item.product.price).toFixed(2)}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            data-testid={`button-decrease-${item.product.id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
                          <span className="w-8 text-center" data-testid={`text-quantity-${item.product.id}`}>
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            data-testid={`button-increase-${item.product.id}`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-auto"
                            onClick={() => onRemoveItem(item.product.id)}
                            data-testid={`button-remove-${item.product.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-6 border-t border-border space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold" data-testid="text-subtotal">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={onClose}
                  data-testid="button-continue-shopping-bottom"
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
