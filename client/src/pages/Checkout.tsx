import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CartItem, CustomBraceletCartItem, CustomNecklaceCartItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Lock, Shield, CreditCard, Phone, Banknote, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

type UnifiedCartItem = CartItem | CustomBraceletCartItem | CustomNecklaceCartItem;

type PaymentMethod = "stripe" | "zelle" | "cash";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || import.meta.env.VITE_TESTING_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

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
  appliedCoupon?: string;
  couponDiscount: number;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
}

function CheckoutForm({ cart, onSuccess, shippingMethod, setShippingMethod, subtotal, shippingFee, total, calculatedTax, customerAddress, setCustomerAddress, setAddressComplete, appliedCoupon, couponDiscount, customerEmail, setCustomerEmail }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate correct values including coupon discount
  const taxRate = 0.0875;
  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const correctTax = (discountedSubtotal + shippingFee) * taxRate;
  const correctTotal = discountedSubtotal + shippingFee + correctTax;

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
            paymentMethod: "stripe",
            paymentStatus: "paid",
            stripePaymentIntentId: paymentIntent.id,
            couponCode: appliedCoupon,
            discountAmount: couponDiscount.toString(),
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
          {couponDiscount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-primary font-medium">Discount</span>
              <span className="font-medium text-primary" data-testid="text-discount">-${couponDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span data-testid="text-shipping-fee">
              {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax (8.75%)</span>
            <span data-testid="text-tax">${correctTax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xl pt-2 border-t border-border">
            <span className="font-semibold">Total</span>
            <span className="font-bold" data-testid="text-total-checkout">
              ${correctTotal.toFixed(2)}
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
            `Place Order - $${correctTotal.toFixed(2)}`
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [calculatedTax, setCalculatedTax] = useState<number>(0);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [addressComplete, setAddressComplete] = useState(false);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [customerAddress, setCustomerAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState("");
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
  const taxRate = 0.0875;
  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const calculatedTaxAmount = (discountedSubtotal + shippingFee) * taxRate;
  const baseTotal = discountedSubtotal + shippingFee + calculatedTaxAmount;

  // Reset payment method to stripe if switching away from local pickup
  useEffect(() => {
    if (shippingMethod !== "local_pickup" && paymentMethod === "cash") {
      setPaymentMethod("stripe");
    }
  }, [shippingMethod, paymentMethod]);

  const handleApplyCoupon = async () => {
    const couponUpper = couponCode.toUpperCase().trim();
    
    try {
      const response = await fetch(`/api/coupons/validate/${couponUpper}`);
      const result = await response.json();
      
      if (result.valid && result.coupon) {
        const { discountType, discountValue, minimumPurchase } = result.coupon;
        
        if (minimumPurchase && subtotal < parseFloat(minimumPurchase)) {
          toast({
            title: "Minimum Purchase Not Met",
            description: `This coupon requires a minimum purchase of $${minimumPurchase}`,
            variant: "destructive",
          });
          return;
        }
        
        let discount = 0;
        
        if (discountType === "percentage") {
          discount = subtotal * (parseFloat(discountValue) / 100);
        } else {
          discount = Math.min(parseFloat(discountValue), subtotal);
        }
        
        setCouponDiscount(discount);
        setAppliedCoupon(couponUpper);
        toast({
          title: "Coupon Applied!",
          description: `You saved $${discount.toFixed(2)} with code ${couponUpper}`,
        });
      } else {
        toast({
          title: "Invalid Coupon",
          description: result.message || "The coupon code you entered is not valid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate coupon. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveCoupon = () => {
    setCouponDiscount(0);
    setAppliedCoupon("");
    setCouponCode("");
    toast({
      title: "Coupon Removed",
      description: "The discount has been removed from your order.",
    });
  };

  useEffect(() => {
    const isComplete = !!(
      customerAddress.name &&
      customerAddress.address &&
      customerAddress.city &&
      customerAddress.state &&
      customerAddress.zipCode
    );
    setAddressComplete(isComplete);
  }, [customerAddress]);

  // Only create payment intent for Stripe payments
  useEffect(() => {
    if (cart.length === 0) {
      setLocation("/");
      return;
    }

    if (!stripePromise) {
      return;
    }

    if (!addressComplete) {
      return;
    }

    // Only create payment intent if Stripe is selected
    if (paymentMethod !== "stripe") {
      return;
    }

    setIsCreatingPaymentIntent(true);
    setClientSecret("");
    
    apiRequest("POST", "/api/create-payment-intent", { 
      customerAddress,
      cart,
      couponCode: appliedCoupon,
      shippingMethod
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setCalculatedTax(data.taxAmount || 0);
        setCalculatedTotal(data.totalAmount || baseTotal);
        if (data.discountAmount !== undefined) {
          setCouponDiscount(data.discountAmount);
        }
        setIsCreatingPaymentIntent(false);
      })
      .catch((error) => {
        console.error("Payment intent creation failed:", error);
        setIsCreatingPaymentIntent(false);
        toast({
          title: "Payment Setup Error",
          description: error.message || "Unable to initialize payment. Please try again.",
          variant: "destructive",
        });
      });
  }, [cart, shippingMethod, addressComplete, appliedCoupon, paymentMethod]);

  const handleZelleOrCashOrder = async () => {
    if (!customerAddress.name || !customerEmail || !customerAddress.address || !customerAddress.city || !customerAddress.state || !customerAddress.zipCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping details and email",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      const orderData = {
        customerName: customerAddress.name,
        customerEmail: customerEmail,
        shippingAddress: customerAddress.address,
        city: customerAddress.city,
        state: customerAddress.state,
        zipCode: customerAddress.zipCode,
        items: JSON.stringify(cart),
        totalAmount: baseTotal.toString(),
        taxAmount: calculatedTaxAmount.toString(),
        shippingMethod: shippingMethod,
        shippingFee: shippingFee.toString(),
        status: "pending",
        paymentMethod: paymentMethod,
        paymentStatus: "pending_payment",
        couponCode: appliedCoupon || null,
        discountAmount: couponDiscount.toString(),
      };

      await apiRequest("POST", "/api/orders", orderData);
      
      setOrderPlaced(true);
      
      toast({
        title: "Order Placed Successfully!",
        description: paymentMethod === "zelle" 
          ? "Please send your Zelle payment to complete your order." 
          : "Your order is confirmed for pickup. Please bring cash payment.",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleSuccess = () => {
    onClearCart();
    setTimeout(() => {
      setLocation("/");
    }, 2000);
  };

  const handleZelleCashSuccess = () => {
    onClearCart();
    setTimeout(() => {
      setLocation("/");
    }, 3000);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-card border border-card-border rounded-lg p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="font-serif text-3xl font-bold mb-4">Order Confirmed!</h1>
            
            {paymentMethod === "zelle" ? (
              <div className="space-y-4">
                <p className="text-lg">Please send your payment via Zelle to complete your order:</p>
                <div className="bg-primary/10 p-6 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-xl font-bold text-primary mb-2">
                    <Phone className="w-6 h-6" />
                    <span>201-908-1726</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Send exactly <strong>${baseTotal.toFixed(2)}</strong></p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your order will be processed once we confirm your Zelle payment. You'll receive an email confirmation shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-lg">Your order is confirmed for local pickup!</p>
                <div className="bg-primary/10 p-6 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-xl font-bold text-primary mb-2">
                    <Banknote className="w-6 h-6" />
                    <span>Cash Payment: ${baseTotal.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  We'll contact you to arrange pickup. Please bring exact cash payment. You'll receive an email confirmation shortly.
                </p>
              </div>
            )}
            
            <Button
              onClick={handleZelleCashSuccess}
              className="mt-6"
              size="lg"
              data-testid="button-continue-shopping"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
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
              
              {!appliedCoupon ? (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="text-sm"
                      data-testid="input-coupon"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim()}
                    data-testid="button-apply-coupon"
                  >
                    Apply
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between text-sm bg-primary/10 p-2 rounded">
                  <span className="text-primary font-medium">
                    Coupon: {appliedCoupon} applied!
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-sm text-destructive hover:text-destructive/80"
                    onClick={handleRemoveCoupon}
                    data-testid="button-remove-coupon"
                  >
                    Remove
                  </Button>
                </div>
              )}
              
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-primary font-medium">Discount</span>
                  <span className="font-medium text-primary">-${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (8.75%)</span>
                <span className="font-medium">${calculatedTaxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-border">
                <span className="font-semibold">Total</span>
                <span className="font-bold">${baseTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment method selection and form for non-Stripe payments */}
        {paymentMethod !== "stripe" || !clientSecret ? (
          <div className="space-y-6">
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
                    <Label htmlFor="email-prelim">Email *</Label>
                    <Input
                      id="email-prelim"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="your@email.com"
                      data-testid="input-email-prelim"
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
              <h2 className="font-serif text-2xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label 
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                    paymentMethod === "stripe" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover-elevate"
                  }`}
                  data-testid="label-payment-stripe"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={paymentMethod === "stripe"}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-4 h-4"
                      data-testid="radio-payment-stripe"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold">Credit/Debit Card</div>
                        <div className="text-sm text-muted-foreground">Secure payment via Stripe</div>
                      </div>
                    </div>
                  </div>
                </label>

                <label 
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                    paymentMethod === "zelle" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover-elevate"
                  }`}
                  data-testid="label-payment-zelle"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="zelle"
                      checked={paymentMethod === "zelle"}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-4 h-4"
                      data-testid="radio-payment-zelle"
                    />
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold">Zelle</div>
                        <div className="text-sm text-muted-foreground">Send payment to 201-908-1726</div>
                      </div>
                    </div>
                  </div>
                </label>

                {shippingMethod === "local_pickup" && (
                  <label 
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "cash" 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover-elevate"
                    }`}
                    data-testid="label-payment-cash"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-4 h-4"
                        data-testid="radio-payment-cash"
                      />
                      <div className="flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-primary" />
                        <div>
                          <div className="font-semibold">Cash on Pickup</div>
                          <div className="text-sm text-muted-foreground">Pay when you pick up your order</div>
                        </div>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Zelle Payment Instructions */}
            {paymentMethod === "zelle" && addressComplete && customerEmail && (
              <div className="bg-card border border-card-border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3">Zelle Payment Instructions</h3>
                <div className="bg-primary/10 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-lg font-bold text-primary mb-1">
                    <Phone className="w-5 h-5" />
                    <span>201-908-1726</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Send exactly <strong>${baseTotal.toFixed(2)}</strong> via Zelle</p>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mb-4">
                  <li>Open your banking app and select Zelle</li>
                  <li>Send <strong>${baseTotal.toFixed(2)}</strong> to <strong>201-908-1726</strong></li>
                  <li>Place your order below - we'll confirm once payment is received</li>
                </ol>
                <Button
                  onClick={handleZelleOrCashOrder}
                  disabled={isPlacingOrder}
                  className="w-full font-bold rounded-lg"
                  size="lg"
                  style={{ background: isPlacingOrder ? undefined : 'linear-gradient(135deg, var(--rose) 0%, var(--gold) 100%)', color: isPlacingOrder ? undefined : '#2b211b' }}
                  data-testid="button-place-zelle-order"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Place Order - $${baseTotal.toFixed(2)}`
                  )}
                </Button>
              </div>
            )}

            {/* Cash Payment Instructions */}
            {paymentMethod === "cash" && addressComplete && customerEmail && (
              <div className="bg-card border border-card-border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3">Cash Payment on Pickup</h3>
                <div className="bg-primary/10 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-lg font-bold text-primary mb-1">
                    <Banknote className="w-5 h-5" />
                    <span>Total Due: ${baseTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Please bring exact cash at pickup</p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  After placing your order, we'll contact you via email to arrange a pickup time and location. Please bring the exact cash amount.
                </p>
                <Button
                  onClick={handleZelleOrCashOrder}
                  disabled={isPlacingOrder}
                  className="w-full font-bold rounded-lg"
                  size="lg"
                  style={{ background: isPlacingOrder ? undefined : 'linear-gradient(135deg, var(--rose) 0%, var(--gold) 100%)', color: isPlacingOrder ? undefined : '#2b211b' }}
                  data-testid="button-place-cash-order"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Place Order - $${baseTotal.toFixed(2)}`
                  )}
                </Button>
              </div>
            )}

            {/* Show message if Zelle/Cash selected but form incomplete */}
            {(paymentMethod === "zelle" || paymentMethod === "cash") && (!addressComplete || !customerEmail) && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
                <p className="text-muted-foreground">Please complete all shipping information and provide your email to continue.</p>
              </div>
            )}

            {/* Show Stripe loading state */}
            {paymentMethod === "stripe" && addressComplete && isCreatingPaymentIntent && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Preparing secure payment...</span>
              </div>
            )}

            {/* Message if Stripe is selected but form not complete */}
            {paymentMethod === "stripe" && !addressComplete && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
                <p className="text-muted-foreground">Please complete all shipping information to proceed with payment.</p>
              </div>
            )}
          </div>
        ) : (
          /* Stripe payment form */
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
              appliedCoupon={appliedCoupon}
              couponDiscount={couponDiscount}
              customerEmail={customerEmail}
              setCustomerEmail={setCustomerEmail}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
