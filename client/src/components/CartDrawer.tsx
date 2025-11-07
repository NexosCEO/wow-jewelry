import { CartItem, CustomBraceletCartItem, CustomNecklaceCartItem } from "@shared/schema";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { useState } from "react";

type UnifiedCartItem = CartItem | CustomBraceletCartItem | CustomNecklaceCartItem;

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: UnifiedCartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

export function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onClearCart }: CartDrawerProps) {
  const [, setLocation] = useLocation();
  const [showClearDialog, setShowClearDialog] = useState(false);
  
  const subtotal = cart.reduce((sum, item) => {
    if ("product" in item) {
      return sum + parseFloat(item.product.price) * item.quantity;
    } else if ("price" in item) {
      return sum + parseFloat(item.price) * item.quantity;
    }
    return sum;
  }, 0);

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
                  {cart.map((item, index) => {
                    const isProduct = "product" in item;
                    const itemId = isProduct ? item.product?.id : item.configId;
                    const itemName = isProduct ? item.product?.name : item.templateName;
                    const itemPrice = isProduct ? item.product?.price : item.price;
                    const itemImage = isProduct ? item.product?.imageUrl : "/attached_assets/IMG_3453_1761882788256.jpeg";
                    
                    if (!itemId) {
                      console.error("Cart item missing ID:", item);
                      return null;
                    }
                    
                    return (
                      <div key={itemId} className="flex gap-4" data-testid={`cart-item-${itemId}`}>
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="w-20 h-20 object-cover rounded-md border border-card-border"
                          data-testid={`img-cart-${itemId}`}
                        />
                        
                        <div className="flex-1 space-y-2">
                          <h3 className="font-medium" data-testid={`text-cart-name-${itemId}`}>{itemName}</h3>
                          {!isProduct && "charmNames" in item && item.charmNames.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Charms: {item.charmNames.join(", ")}
                            </p>
                          )}
                          {!isProduct && "beadNames" in item && item.beadNames.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Beads: {item.beadNames.join(", ")}
                            </p>
                          )}
                          <p className="text-sm font-semibold" data-testid={`text-cart-price-${itemId}`}>
                            ${parseFloat(itemPrice).toFixed(2)}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onUpdateQuantity(itemId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              data-testid={`button-decrease-${itemId}`}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            
                            <span className="w-8 text-center" data-testid={`text-quantity-${itemId}`}>
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onUpdateQuantity(itemId, item.quantity + 1)}
                              data-testid={`button-increase-${itemId}`}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 ml-auto"
                              onClick={() => onRemoveItem(itemId)}
                              data-testid={`button-remove-${itemId}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    className="flex-1"
                    onClick={onClose}
                    data-testid="button-continue-shopping-bottom"
                  >
                    Continue Shopping
                  </Button>
                  <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        data-testid="button-clear-cart"
                      >
                        Clear Cart
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-testid="dialog-clear-cart">
                      <AlertDialogHeader>
                        <AlertDialogTitle data-testid="text-dialog-title">Clear Cart?</AlertDialogTitle>
                        <AlertDialogDescription data-testid="text-dialog-description">
                          Are you sure you want to remove all items from your cart? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-testid="button-cancel-clear">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => {
                            onClearCart();
                            setShowClearDialog(false);
                          }}
                          data-testid="button-confirm-clear"
                        >
                          Clear Cart
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
