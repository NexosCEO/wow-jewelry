import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CartItem, CustomBraceletCartItem, CustomNecklaceCartItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Lock, Shield, CreditCard } from "lucide-react";
import { useLocation } from "wouter";

type UnifiedCartItem = CartItem | CustomBraceletCartItem | CustomNecklaceCartItem;

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface CheckoutFormProps {
  cart: UnifiedCartItem[];
  onSuccess: () => void;
  shippingMethod: "standard" | "local_pickup";
  setShippingMethod: (method: "standard" | "local_pickup") => void;
  subtotal: number;
  shippingFee: number;
  total: number;
  calculatedTax: number;
  customerAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  setCustomerAddress: (address: any) => void;
  setAddressComplete: (complete: boolean) => void;
}

function CheckoutForm({ cart, onSuccess, shippingMethod, setShippingMethod, subtotal, shippingFee, total, calculatedTax, customerAddress, setCustomerAddress, setAddressComplete }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    const isComplete = !!(
      customerAddress.name &&
      customerAddress.address &&
      customerAddress.city &&
      customerAddress.state &&
      customerAddress.zipCode
    );
    setAddressComplete(isComplete);
  }, [customerAddress, setAddressComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    if (!customerAddress.name || !customerEmail || !customerAddress.address || !customerAddress.city || !customerAddress.state || !customerAddress.zipCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping details",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/checkout",
          receipt_email: customerEmail,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        try {
          const paymentDetailsResponse = await apiRequest("GET", `/api/payment-intent/${paymentIntent.id}`);
          const paymentDetails = await paymentDetailsResponse.json();
          
          const actualTax = paymentDetails.taxAmount || 0;
          const actualTotal = paymentDetails.amount || total;

          const orderData = {
            customerName: customerAddress.name,
            customerEmail: customerEmail,
            shippingAddress: customerAddress.address,
            city: customerAddress.city,
            state: customerAddress.state,
            zipCode: customerAddress.zipCode,
            items: JSON.stringify(cart),
            totalAmount: actualTotal.toString(),
            taxAmount: actualTax.toString(),
            shippingMethod: shippingMethod,
            shippingFee: shippingFee.toString(),
            status: "completed",
            stripePaymentIntentId: paymentIntent.id,
          };

          await apiRequest("POST", "/api/orders", orderData);
          toast({
            title: "Order Placed Successfully!",
            description: "Thank you for your purchase. You'll receive a confirmation email shortly.",
          });
          onSuccess();
        } catch (orderError) {
          toast({
            title: "Payment Successful but Order Failed",
            description: "Your payment was processed, but we couldn't save your order. Please contact support with your payment ID.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold mb-4">Shipping Information</h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={customerAddress.name}
                onChange={(e) => setCustomerAddress({ ...customerAddress, name: e.target.value })}
                required
                data-testid="input-name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              value={customerAddress.address}
              onChange={(e) => setCustomerAddress({ ...customerAddress, address: e.target.value })}
              required
              data-testid="input-address"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={customerAddress.city}
                onChange={(e) => setCustomerAddress({ ...customerAddress, city: e.target.value })}
                required
                data-testid="input-city"
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={customerAddress.state}
                onChange={(e) => setCustomerAddress({ ...customerAddress, state: e.target.value })}
                required
                data-testid="input-state"
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={customerAddress.zipCode}
                onChange={(e) => setCustomerAddress({ ...customerAddress, zipCode: e.target.value })}
                required
                data-testid="input-zipcode"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-2xl font-semibold mb-4">Shipping Method</h2>
        <div className="space-y-3">
          <label 
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
              shippingMethod === "standard" 
                ? "border-primary bg-primary/5" 
                : "border-border hover-elevate"
            }`}
            data-testid="label-shipping-standard"
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shippingMethod"
                value="standard"
                checked={shippingMethod === "standard"}
                onChange={(e) => setShippingMethod(e.target.value as "standard" | "local_pickup")}
                className="w-4 h-4"
                data-testid="radio-shipping-standard"
              />
              <div>
                <div className="font-semibold">Standard Shipping</div>
                <div className="text-sm text-muted-foreground">Delivery via USPS, UPS, or FedEx</div>
              </div>
            </div>
            <div className="font-semibold">$5.99</div>
          </label>

          <label 
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
              shippingMethod === "local_pickup" 
                ? "border-primary bg-primary/5" 
                : "border-border hover-elevate"
            }`}
            data-testid="label-shipping-local"
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="shippingMethod"
                value="local_pickup"
                checked={shippingMethod === "local_pickup"}
                onChange={(e) => setShippingMethod(e.target.value as "standard" | "local_pickup")}
                className="w-4 h-4"
                data-testid="radio-shipping-local"
              />
              <div>
                <div className="font-semibold">Local Pickup</div>
                <div className="text-sm text-muted-foreground">Hand delivery by arrangement</div>
              </div>
            </div>
            <div className="font-semibold text-green-600">FREE</div>
          </label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl font-semibold">Payment Details</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Secure Checkout</span>
          </div>
        </div>
        <div className="p-4 border border-border rounded-md bg-card">
          <PaymentElement />
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span>256-bit SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <CreditCard className="w-4 h-4" />
            <span>Powered by Stripe</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span data-testid="text-shipping-fee">
              {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
            </span>
          </div>
          <div className="flex items-center justify-between text-xl pt-2 border-t border-border">
            <span className="font-semibold">Total</span>
            <span className="font-bold" data-testid="text-total-checkout">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full font-bold rounded-lg"
          size="lg"
          style={{ background: !stripe || isProcessing ? undefined : 'linear-gradient(135deg, var(--rose) 0%, var(--gold) 100%)', color: !stripe || isProcessing ? undefined : '#2b211b' }}
          data-testid="button-place-order"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Place Order - $${total.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}

interface CheckoutProps {
  cart: UnifiedCartItem[];
  onClearCart: () => void;
}

export default function Checkout({ cart, onClearCart }: CheckoutProps) {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "local_pickup">("standard");
  const [calculatedTax, setCalculatedTax] = useState<number>(0);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [addressComplete, setAddressComplete] = useState(false);
  const [customerAddress, setCustomerAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const { toast } = useToast();

  const subtotal = cart.reduce((sum, item) => {
    if ("product" in item) {
      return sum + parseFloat(item.product.price) * item.quantity;
    } else if ("price" in item) {
      return sum + parseFloat(item.price) * item.quantity;
    }
    return sum;
  }, 0);

  const shippingFee = shippingMethod === "standard" ? 5.99 : 0;
  const baseTotal = subtotal + shippingFee;

  useEffect(() => {
    if (cart.length === 0) {
      setLocation("/");
      return;
    }

    if (!stripePromise) {
      toast({
        title: "Payment Not Available",
        description: "Stripe payment processing is not configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    if (!addressComplete || !customerAddress.name || !customerAddress.address || !customerAddress.city || !customerAddress.state || !customerAddress.zipCode) {
      return;
    }

    apiRequest("POST", "/api/create-payment-intent", { 
      amount: baseTotal,
      customerAddress,
      cart
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        if (data.taxAmount) {
          setCalculatedTax(data.taxAmount);
          setCalculatedTotal(data.totalAmount);
        } else {
          setCalculatedTax(0);
          setCalculatedTotal(baseTotal);
        }
      })
      .catch((error) => {
        console.error("Payment intent creation failed:", error);
        toast({
          title: "Payment Setup Error",
          description: error.message || "Unable to initialize payment. Please try again.",
          variant: "destructive",
        });
      });
  }, [shippingMethod, addressComplete]); // Recreate when shipping or address changes

  const handleSuccess = () => {
    onClearCart();
    setTimeout(() => {
      setLocation("/");
    }, 2000);
  };

  if (!stripePromise) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="font-serif text-2xl mb-4">Payment Not Available</h2>
        <p className="text-muted-foreground text-center mb-6">
          Stripe payment processing is not configured yet. You can browse products, but checkout is temporarily disabled.
        </p>
        <Button onClick={() => setLocation("/")}>Back to Shop</Button>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loader-checkout" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lock className="w-5 h-5 text-primary" />
          <h1 className="font-serif text-4xl font-bold text-center" data-testid="text-checkout-title">Secure Checkout</h1>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-8">Your information is protected with industry-standard encryption</p>

        <div className="mb-8 p-4 bg-card rounded-md border border-card-border">
          <h3 className="font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2">
            {cart.map((item) => {
              const isProduct = "product" in item;
              const itemId = isProduct ? item.product.id : item.configId;
              const itemName = isProduct ? item.product.name : item.templateName;
              const itemPrice = isProduct ? item.product.price : item.price;
              
              return (
                <div key={itemId} className="flex justify-between text-sm" data-testid={`summary-item-${itemId}`}>
                  <span>
                    {itemName} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    ${(parseFloat(itemPrice) * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
            <div className="pt-3 mt-3 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              {calculatedTax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">${calculatedTax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base pt-2 border-t border-border">
                <span className="font-semibold">Total</span>
                <span className="font-bold">${(calculatedTotal > 0 ? calculatedTotal : baseTotal).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }} key={clientSecret}>
          <CheckoutForm 
            cart={cart} 
            onSuccess={handleSuccess}
            shippingMethod={shippingMethod}
            setShippingMethod={setShippingMethod}
            subtotal={subtotal}
            shippingFee={shippingFee}
            total={calculatedTotal > 0 ? calculatedTotal : baseTotal}
            calculatedTax={calculatedTax}
            customerAddress={customerAddress}
            setCustomerAddress={setCustomerAddress}
            setAddressComplete={setAddressComplete}
          />
        </Elements>
      </div>
    </div>
  );
}
