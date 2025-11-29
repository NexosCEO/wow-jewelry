import { useQuery, useMutation } from "@tanstack/react-query";
import { Order, Product, Charm, BraceletBead } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Package, Printer, Mail, ExternalLink, Lock, LogOut, PackageOpen, Plus, Minus, Edit, Check, X, Ticket, Calendar, Percent, DollarSign, Hash, Trash2, CreditCard, Phone, Banknote, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAdminToken, setSession, isAdminAuthenticated, clearAdminToken, updateLastActivity, getRemainingSessionTime, isSessionExpired, refreshSessionExpiry } from "@/lib/adminAuth";
import { useState, useEffect, useCallback } from "react";

export default function Admin() {
  const { toast } = useToast();
  const [accessKey, setAccessKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminAuthenticated());
  const [remainingTime, setRemainingTime] = useState(getRemainingSessionTime());
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Track user activity to reset inactivity timer
  const handleUserActivity = useCallback(() => {
    if (isAuthenticated) {
      updateLastActivity();
      setRemainingTime(getRemainingSessionTime());
    }
  }, [isAuthenticated]);

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated, handleUserActivity]);

  // Check session expiration every second
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (isSessionExpired()) {
        clearAdminToken();
        setIsAuthenticated(false);
        setAccessKey("");
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity. Please log in again.",
          variant: "destructive",
        });
      } else {
        setRemainingTime(getRemainingSessionTime());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, toast]);

  // Format remaining time as MM:SS
  const formatRemainingTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const token = getAdminToken();
      const response = await fetch("/api/orders", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        clearAdminToken();
        setIsAuthenticated(false);
        throw new Error("Authentication failed - invalid access key");
      }
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      return response.json();
    },
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  const { data: charms, isLoading: charmsLoading } = useQuery<Charm[]>({
    queryKey: ["/api/charms"],
    enabled: isAuthenticated,
  });

  const { data: beads, isLoading: beadsLoading } = useQuery<BraceletBead[]>({
    queryKey: ["/api/bracelet-beads"],
    enabled: isAuthenticated,
  });

  const { data: coupons, isLoading: couponsLoading } = useQuery<any[]>({
    queryKey: ["/api/coupons"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const token = getAdminToken();
      const response = await fetch("/api/coupons", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        clearAdminToken();
        setIsAuthenticated(false);
        throw new Error("Authentication failed - invalid access key");
      }
      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }
      return response.json();
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      // Call login endpoint to verify password and get session token
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: accessKey }),
      });

      if (response.status === 401) {
        setLoginError("Invalid password. Please try again.");
        setIsLoggingIn(false);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setLoginError(data.message || "Unable to verify credentials. Please try again.");
        setIsLoggingIn(false);
        return;
      }

      const { token, expiresIn } = await response.json();
      
      // Store session token (not password)
      setSession(token, expiresIn);
      setIsAuthenticated(true);
      setRemainingTime(expiresIn * 1000);
      setAccessKey(""); // Clear password from memory
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard.",
      });
    } catch (error) {
      setLoginError("Connection error. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = getAdminToken();
      if (token) {
        await fetch("/api/admin/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      // Ignore logout errors, just clear local session
    }
    clearAdminToken();
    setIsAuthenticated(false);
    setAccessKey("");
  };

  // Coupon handlers
  const resetCouponForm = () => {
    setCouponForm({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minimumPurchase: "",
      maxUses: "",
      expiresAt: "",
      isActive: true,
    });
  };

  const handleEditCoupon = (coupon: any) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minimumPurchase: coupon.minimumPurchase?.toString() || "",
      maxUses: coupon.maxUses?.toString() || "",
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : "",
      isActive: coupon.isActive ?? true,
    });
    setShowCouponForm(true);
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCoupon(true);

    try {
      const data = {
        code: couponForm.code,
        description: '',
        discountType: couponForm.discountType,
        discountValue: couponForm.discountValue, // Keep as string - backend expects string
        minimumPurchase: couponForm.minimumPurchase || null,
        maxUsage: couponForm.maxUses ? parseInt(couponForm.maxUses) : null,
        startDate: null,
        endDate: couponForm.expiresAt || null,
        isActive: couponForm.isActive,
      };

      const token = getAdminToken();
      const url = editingCoupon ? `/api/coupons/${editingCoupon.id}` : "/api/coupons";
      const method = editingCoupon ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save coupon");
      }

      toast({
        title: editingCoupon ? "Coupon Updated" : "Coupon Created",
        description: `Coupon ${couponForm.code} has been ${editingCoupon ? "updated" : "created"} successfully`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      setShowCouponForm(false);
      setEditingCoupon(null);
      resetCouponForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    
    setDeletingCouponId(couponId);
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete coupon");
      }

      toast({
        title: "Coupon Deleted",
        description: "The coupon has been deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingCouponId(null);
    }
  };

  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [processingProductIds, setProcessingProductIds] = useState<Set<string>>(new Set());
  const [processingCharmIds, setProcessingCharmIds] = useState<Set<string>>(new Set());
  const [processingBeadIds, setProcessingBeadIds] = useState<Set<string>>(new Set());
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>("");
  
  // Coupon form state
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    minimumPurchase: "",
    maxUses: "",
    expiresAt: "",
    isActive: true,
  });

  const generateLabelMutation = useMutation({
    mutationFn: async (orderId: string) => {
      setProcessingOrderId(orderId);
      const token = getAdminToken();
      const response = await fetch(`/api/orders/${orderId}/shipping-label`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate label");
      }
      return await response.json();
    },
    onSuccess: (data: any) => {
      setProcessingOrderId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Label Generated!",
        description: "Shipping label is ready to print",
      });
      if (data.labelUrl) {
        window.open(data.labelUrl, "_blank");
      }
    },
    onError: (error) => {
      setProcessingOrderId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to generate shipping label",
        variant: "destructive",
      });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (orderId: string) => {
      setProcessingOrderId(orderId);
      const token = getAdminToken();
      const response = await fetch(`/api/orders/${orderId}/notify`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send notification");
      }
      return await response.json();
    },
    onSuccess: () => {
      setProcessingOrderId(null);
      toast({
        title: "Notification Sent!",
        description: "Customer has been notified",
      });
    },
    onError: (error) => {
      setProcessingOrderId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async (orderId: string) => {
      setProcessingOrderId(orderId);
      const token = getAdminToken();
      const response = await fetch(`/api/orders/${orderId}/confirm-payment`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm payment");
      }
      return await response.json();
    },
    onSuccess: () => {
      setProcessingOrderId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Payment Confirmed!",
        description: "Order payment has been confirmed and the order is now ready to process.",
      });
    },
    onError: (error) => {
      setProcessingOrderId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm payment",
        variant: "destructive",
      });
    },
  });

  const updateInventoryMutation = useMutation({
    mutationFn: async ({ productId, quantityChange }: { productId: string; quantityChange: number }) => {
      setProcessingProductIds(prev => new Set(prev).add(productId));
      const token = getAdminToken();
      const response = await fetch(`/api/products/${productId}/inventory`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantityChange }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update inventory");
      }
      return await response.json();
    },
    onSuccess: (data, variables) => {
      setProcessingProductIds(prev => {
        const next = new Set(prev);
        next.delete(variables.productId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Inventory Updated!",
        description: "Product inventory has been updated",
      });
    },
    onError: (error, variables) => {
      setProcessingProductIds(prev => {
        const next = new Set(prev);
        next.delete(variables.productId);
        return next;
      });
      toast({
        title: "Error",
        description: error.message || "Failed to update inventory",
        variant: "destructive",
      });
    },
  });

  const updateCharmInventoryMutation = useMutation({
    mutationFn: async ({ charmId, quantityChange }: { charmId: string; quantityChange: number }) => {
      setProcessingCharmIds(prev => new Set(prev).add(charmId));
      const token = getAdminToken();
      const response = await fetch(`/api/charms/${charmId}/inventory`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantityChange }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update charm inventory");
      }
      return await response.json();
    },
    onSuccess: (data, variables) => {
      setProcessingCharmIds(prev => {
        const next = new Set(prev);
        next.delete(variables.charmId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/charms"] });
      toast({
        title: "Charm Inventory Updated!",
        description: "Charm stock has been updated",
      });
    },
    onError: (error, variables) => {
      setProcessingCharmIds(prev => {
        const next = new Set(prev);
        next.delete(variables.charmId);
        return next;
      });
      toast({
        title: "Error",
        description: error.message || "Failed to update charm inventory",
        variant: "destructive",
      });
    },
  });

  const updateBeadInventoryMutation = useMutation({
    mutationFn: async ({ beadId, quantityChange }: { beadId: string; quantityChange: number }) => {
      setProcessingBeadIds(prev => new Set(prev).add(beadId));
      const token = getAdminToken();
      const response = await fetch(`/api/bracelet-beads/${beadId}/inventory`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantityChange }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update bead inventory");
      }
      return await response.json();
    },
    onSuccess: (data, variables) => {
      setProcessingBeadIds(prev => {
        const next = new Set(prev);
        next.delete(variables.beadId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bracelet-beads"] });
      toast({
        title: "Bead Inventory Updated!",
        description: "Bead stock has been updated",
      });
    },
    onError: (error, variables) => {
      setProcessingBeadIds(prev => {
        const next = new Set(prev);
        next.delete(variables.beadId);
        return next;
      });
      toast({
        title: "Error",
        description: error.message || "Failed to update bead inventory",
        variant: "destructive",
      });
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: async ({ productId, price }: { productId: string; price: number }) => {
      setProcessingProductIds(prev => new Set(prev).add(productId));
      const token = getAdminToken();
      const response = await fetch(`/api/products/${productId}/price`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update price");
      }
      return await response.json();
    },
    onSuccess: (data, variables) => {
      setProcessingProductIds(prev => {
        const next = new Set(prev);
        next.delete(variables.productId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Price Updated!",
        description: "Product price has been updated",
      });
    },
    onError: (error, variables) => {
      setProcessingProductIds(prev => {
        const next = new Set(prev);
        next.delete(variables.productId);
        return next;
      });
      toast({
        title: "Error",
        description: error.message || "Failed to update price",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-serif">
              Admin Login
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Enter your admin password to access the dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="access-key" className="text-sm font-medium mb-2 block">
                  Password
                </Label>
                <Input
                  id="access-key"
                  type="password"
                  placeholder="Enter admin password"
                  value={accessKey}
                  onChange={(e) => {
                    setAccessKey(e.target.value);
                    setLoginError("");
                  }}
                  data-testid="input-admin-key"
                  disabled={isLoggingIn}
                />
              </div>
              {loginError && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md" data-testid="text-auth-error">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {loginError}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full" 
                data-testid="button-admin-login"
                disabled={isLoggingIn || !accessKey}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Session will timeout after 2 minutes of inactivity
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loader-admin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-4xl font-bold mb-2" data-testid="text-admin-title">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground" data-testid="text-admin-subtitle">
              Manage orders, shipping labels, and product inventory
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md" data-testid="session-timer">
              <Clock className="w-4 h-4" />
              <span>Session: {formatRemainingTime(remainingTime)}</span>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-6">
            <TabsTrigger value="orders" data-testid="tab-orders">
              <Package className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="inventory" data-testid="tab-inventory">
              <PackageOpen className="w-4 h-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="charms-beads" data-testid="tab-charms-beads">
              <PackageOpen className="w-4 h-4 mr-2" />
              Charms & Beads
            </TabsTrigger>
            <TabsTrigger value="coupons" data-testid="tab-coupons">
              <Ticket className="w-4 h-4 mr-2" />
              Coupons
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-0">
            {orders && orders.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Package className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground" data-testid="text-no-orders">
                    No orders yet
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {orders?.map((order) => {
            const items = JSON.parse(order.items);
            const hasLabel = !!order.shippingLabelUrl;
            
            return (
              <Card key={order.id} data-testid={`card-order-${order.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="text-xl" data-testid={`text-order-id-${order.id}`}>
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1" data-testid={`text-order-date-${order.id}`}>
                        {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge data-testid={`badge-status-${order.id}`}>
                        {order.status}
                      </Badge>
                      {order.paymentMethod && order.paymentMethod !== "stripe" && (
                        <Badge 
                          variant="outline" 
                          className="flex items-center gap-1"
                          data-testid={`badge-payment-method-${order.id}`}
                        >
                          {order.paymentMethod === "zelle" && <Phone className="w-3 h-3" />}
                          {order.paymentMethod === "cash" && <Banknote className="w-3 h-3" />}
                          {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                        </Badge>
                      )}
                      {order.paymentStatus === "pending_payment" && (
                        <Badge 
                          variant="destructive"
                          data-testid={`badge-payment-pending-${order.id}`}
                        >
                          Awaiting Payment
                        </Badge>
                      )}
                      {order.paymentStatus === "paid" && order.paymentMethod !== "stripe" && (
                        <Badge 
                          variant="outline"
                          className="border-green-500 text-green-600 flex items-center gap-1"
                          data-testid={`badge-payment-confirmed-${order.id}`}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Payment Confirmed
                        </Badge>
                      )}
                      {hasLabel && (
                        <Badge variant="outline" data-testid={`badge-label-${order.id}`}>
                          Label Created
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold mb-2">Customer Information</h4>
                      <div className="text-sm space-y-1 text-muted-foreground">
                        <p data-testid={`text-customer-name-${order.id}`}>{order.customerName}</p>
                        <p data-testid={`text-customer-email-${order.id}`}>{order.customerEmail}</p>
                        <p data-testid={`text-shipping-address-${order.id}`}>
                          {order.shippingAddress}<br />
                          {order.city}, {order.state} {order.zipCode}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {items.map((item: any, index: number) => (
                          <div 
                            key={index} 
                            className="flex justify-between text-sm" 
                            data-testid={`order-item-${order.id}-${index}`}
                          >
                            <span>{item.product.name} x {item.quantity}</span>
                            <span className="font-medium">
                              ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-border space-y-1">
                          {order.couponCode && (
                            <div className="flex justify-between text-sm">
                              <span className="text-primary">Coupon ({order.couponCode})</span>
                              <span className="text-primary">-${parseFloat(order.discountAmount || "0").toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>
                              {order.shippingMethod === "local_pickup" ? (
                                <span className="text-green-600">FREE (Local Pickup)</span>
                              ) : (
                                <span>${parseFloat(order.shippingFee || "5.99").toFixed(2)}</span>
                              )}
                            </span>
                          </div>
                          {order.taxAmount !== undefined && order.taxAmount !== null && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Tax (8.75%)</span>
                              <span data-testid={`text-tax-${order.id}`}>
                                ${parseFloat(order.taxAmount).toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span data-testid={`text-order-total-${order.id}`}>
                              ${parseFloat(order.totalAmount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {order.shippingMethod === "local_pickup" && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2">
                        <PackageOpen className="w-4 h-4 text-amber-600" />
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          Local Pickup - Hand Delivery Arranged
                        </p>
                      </div>
                    </div>
                  )}

                  {order.trackingNumber && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <p className="text-sm font-medium">Tracking Number</p>
                          <p className="text-sm text-muted-foreground font-mono" data-testid={`text-tracking-${order.id}`}>
                            {order.trackingNumber}
                          </p>
                          {order.shippingCarrier && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Carrier: {order.shippingCarrier}
                            </p>
                          )}
                        </div>
                        {order.shippingLabelUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(order.shippingLabelUrl!, "_blank")}
                            data-testid={`button-view-label-${order.id}`}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Label
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {order.paymentStatus === "pending_payment" && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          {order.paymentMethod === "zelle" && <Phone className="w-4 h-4 text-yellow-600" />}
                          {order.paymentMethod === "cash" && <Banknote className="w-4 h-4 text-yellow-600" />}
                          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                            {order.paymentMethod === "zelle" 
                              ? "Awaiting Zelle payment - Check your Zelle for payment from this customer" 
                              : "Awaiting cash payment on pickup"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => confirmPaymentMutation.mutate(order.id)}
                          disabled={processingOrderId === order.id}
                          className="bg-green-600 hover:bg-green-700"
                          data-testid={`button-confirm-payment-${order.id}`}
                        >
                          {processingOrderId === order.id && confirmPaymentMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Confirming...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm Payment Received
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      onClick={() => generateLabelMutation.mutate(order.id)}
                      disabled={processingOrderId === order.id}
                      className="flex-1 sm:flex-none"
                      data-testid={`button-generate-label-${order.id}`}
                    >
                      {processingOrderId === order.id && generateLabelMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Printer className="w-4 h-4 mr-2" />
                          {hasLabel ? "Regenerate Label" : "Generate Shipping Label"}
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => sendNotificationMutation.mutate(order.id)}
                      disabled={processingOrderId === order.id}
                      className="flex-1 sm:flex-none"
                      data-testid={`button-notify-customer-${order.id}`}
                    >
                      {processingOrderId === order.id && sendNotificationMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Notify Customer
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
          </TabsContent>

          <TabsContent value="inventory" className="mt-0">
            {productsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !products || products.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <PackageOpen className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No products found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {products.map((product) => (
                  <Card key={product.id} data-testid={`card-product-${product.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <img
                          src={encodeURI(product.imageUrl)}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-md border border-card-border"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1" data-testid={`text-product-name-${product.id}`}>
                            {product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                          <div className="flex items-center gap-2">
                            {editingPriceId === product.id ? (
                              <>
                                <div className="flex items-center gap-1">
                                  <span className="text-lg font-bold">$</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={tempPrice}
                                    onChange={(e) => setTempPrice(e.target.value)}
                                    className="w-24 h-8 text-lg font-bold"
                                    data-testid={`input-price-${product.id}`}
                                    autoFocus
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    const price = parseFloat(tempPrice);
                                    if (!isNaN(price) && price >= 0) {
                                      updatePriceMutation.mutate({ productId: product.id, price });
                                      setEditingPriceId(null);
                                      setTempPrice("");
                                    }
                                  }}
                                  disabled={processingProductIds.has(product.id)}
                                  data-testid={`button-save-price-${product.id}`}
                                >
                                  <Check className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingPriceId(null);
                                    setTempPrice("");
                                  }}
                                  data-testid={`button-cancel-price-${product.id}`}
                                >
                                  <X className="w-4 h-4 text-destructive" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <p className="text-lg font-bold" data-testid={`text-price-${product.id}`}>
                                  ${parseFloat(product.price).toFixed(2)}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingPriceId(product.id);
                                    setTempPrice(parseFloat(product.price).toFixed(2));
                                  }}
                                  data-testid={`button-edit-price-${product.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">Stock</p>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateInventoryMutation.mutate({ productId: product.id, quantityChange: -1 })}
                                disabled={product.stockQuantity === 0 || processingProductIds.has(product.id)}
                                data-testid={`button-decrease-stock-${product.id}`}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <div className="min-w-[60px] text-center">
                                <span 
                                  className={`text-xl font-bold ${product.stockQuantity === 0 ? 'text-destructive' : ''}`}
                                  data-testid={`text-stock-${product.id}`}
                                >
                                  {product.stockQuantity}
                                </span>
                                {!product.inStock && (
                                  <Badge variant="destructive" className="mt-1 text-xs">Out of Stock</Badge>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateInventoryMutation.mutate({ productId: product.id, quantityChange: 1 })}
                                disabled={processingProductIds.has(product.id)}
                                data-testid={`button-increase-stock-${product.id}`}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="charms-beads" className="mt-0">
            {(charmsLoading || beadsLoading) ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Charms Section */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Charms Inventory</h2>
                  {!charms || charms.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <PackageOpen className="w-16 h-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No charms found</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {charms.map((charm) => (
                        <Card key={charm.id} data-testid={`card-charm-${charm.id}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <img
                                src={encodeURI(charm.imageUrl)}
                                alt={charm.name}
                                className="w-20 h-20 object-cover rounded-md border border-card-border"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg mb-1" data-testid={`text-charm-name-${charm.id}`}>
                                  {charm.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">{charm.category}</p>
                                <p className="text-lg font-bold">${charm.price}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-2">Stock</p>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateCharmInventoryMutation.mutate({ charmId: charm.id, quantityChange: -1 })}
                                    disabled={charm.stockQuantity === 0 || processingCharmIds.has(charm.id)}
                                    data-testid={`button-decrease-charm-stock-${charm.id}`}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <div className="min-w-[60px] text-center">
                                    <span 
                                      className={`text-xl font-bold ${charm.stockQuantity === 0 ? 'text-destructive' : ''}`}
                                      data-testid={`text-charm-stock-${charm.id}`}
                                    >
                                      {charm.stockQuantity}
                                    </span>
                                    {!charm.inStock && (
                                      <Badge variant="destructive" className="mt-1 text-xs">Out of Stock</Badge>
                                    )}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateCharmInventoryMutation.mutate({ charmId: charm.id, quantityChange: 1 })}
                                    disabled={processingCharmIds.has(charm.id)}
                                    data-testid={`button-increase-charm-stock-${charm.id}`}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Beads Section */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Beads Inventory</h2>
                  {!beads || beads.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <PackageOpen className="w-16 h-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No beads found</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {beads.map((bead) => (
                        <Card key={bead.id} data-testid={`card-bead-${bead.id}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <img
                                src={encodeURI(bead.imageUrl)}
                                alt={bead.name}
                                className="w-20 h-20 object-cover rounded-md border border-card-border"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg mb-1" data-testid={`text-bead-name-${bead.id}`}>
                                  {bead.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">{bead.color}</p>
                                <p className="text-lg font-bold">${bead.price}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-2">Stock</p>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateBeadInventoryMutation.mutate({ beadId: bead.id, quantityChange: -1 })}
                                    disabled={bead.stockQuantity === 0 || processingBeadIds.has(bead.id)}
                                    data-testid={`button-decrease-bead-stock-${bead.id}`}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <div className="min-w-[60px] text-center">
                                    <span 
                                      className={`text-xl font-bold ${bead.stockQuantity === 0 ? 'text-destructive' : ''}`}
                                      data-testid={`text-bead-stock-${bead.id}`}
                                    >
                                      {bead.stockQuantity}
                                    </span>
                                    {!bead.inStock && (
                                      <Badge variant="destructive" className="mt-1 text-xs">Out of Stock</Badge>
                                    )}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateBeadInventoryMutation.mutate({ beadId: bead.id, quantityChange: 1 })}
                                    disabled={processingBeadIds.has(bead.id)}
                                    data-testid={`button-increase-bead-stock-${bead.id}`}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="coupons" className="mt-0">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Manage Coupons</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create and manage discount coupons for customers
                      </p>
                    </div>
                    <Button 
                      onClick={() => setShowCouponForm(true)}
                      data-testid="button-add-coupon"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Coupon
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {showCouponForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCouponSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="coupon-code">Coupon Code *</Label>
                          <Input
                            id="coupon-code"
                            name="code"
                            placeholder="SAVE20"
                            value={couponForm.code}
                            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                            required
                            data-testid="input-coupon-code"
                          />
                        </div>
                        <div>
                          <Label htmlFor="coupon-type">Discount Type *</Label>
                          <select
                            id="coupon-type"
                            name="discountType"
                            value={couponForm.discountType}
                            onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as 'percentage' | 'fixed' })}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            required
                            data-testid="select-coupon-type"
                          >
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed Amount</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="coupon-value">
                            Discount Value {couponForm.discountType === 'percentage' ? '(%)' : '($)'} *
                          </Label>
                          <Input
                            id="coupon-value"
                            name="discountValue"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder={couponForm.discountType === 'percentage' ? "20" : "10.00"}
                            value={couponForm.discountValue}
                            onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                            required
                            data-testid="input-coupon-value"
                          />
                        </div>
                        <div>
                          <Label htmlFor="coupon-min-purchase">Minimum Purchase Amount</Label>
                          <Input
                            id="coupon-min-purchase"
                            name="minimumPurchase"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={couponForm.minimumPurchase}
                            onChange={(e) => setCouponForm({ ...couponForm, minimumPurchase: e.target.value })}
                            data-testid="input-coupon-min-purchase"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="coupon-max-uses">Maximum Uses (0 = unlimited)</Label>
                          <Input
                            id="coupon-max-uses"
                            name="maxUses"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={couponForm.maxUses}
                            onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                            data-testid="input-coupon-max-uses"
                          />
                        </div>
                        <div>
                          <Label htmlFor="coupon-expiry">Expiry Date</Label>
                          <Input
                            id="coupon-expiry"
                            name="expiresAt"
                            type="datetime-local"
                            value={couponForm.expiresAt}
                            onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                            data-testid="input-coupon-expiry"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 py-2">
                        <input
                          type="checkbox"
                          id="coupon-active"
                          checked={couponForm.isActive}
                          onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                          className="w-4 h-4 rounded border-border"
                          data-testid="checkbox-coupon-active"
                        />
                        <Label htmlFor="coupon-active" className="cursor-pointer">
                          Active (customers can use this coupon)
                        </Label>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowCouponForm(false);
                            setEditingCoupon(null);
                            resetCouponForm();
                          }}
                          data-testid="button-cancel-coupon"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={savingCoupon} data-testid="button-save-coupon">
                          {savingCoupon ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            editingCoupon ? 'Update Coupon' : 'Create Coupon'
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {couponsLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </CardContent>
                </Card>
              ) : coupons && coupons.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Ticket className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground" data-testid="text-no-coupons">
                      No coupons created yet
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {coupons?.map((coupon) => (
                    <Card key={coupon.id} data-testid={`card-coupon-${coupon.id}`}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold" data-testid={`text-coupon-code-${coupon.id}`}>
                                {coupon.code}
                              </h3>
                              {coupon.isActive ? (
                                <Badge variant="default" data-testid={`badge-coupon-active-${coupon.id}`}>Active</Badge>
                              ) : (
                                <Badge variant="secondary" data-testid={`badge-coupon-inactive-${coupon.id}`}>Inactive</Badge>
                              )}
                              {coupon.expiresAt && new Date(coupon.expiresAt) < new Date() && (
                                <Badge variant="destructive" data-testid={`badge-coupon-expired-${coupon.id}`}>Expired</Badge>
                              )}
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  {coupon.discountType === 'percentage' ? (
                                    <Percent className="w-4 h-4" />
                                  ) : (
                                    <DollarSign className="w-4 h-4" />
                                  )}
                                  <span>
                                    {coupon.discountType === 'percentage' 
                                      ? `${coupon.discountValue}% off`
                                      : `$${parseFloat(coupon.discountValue).toFixed(2)} off`
                                    }
                                  </span>
                                </div>
                                {coupon.minimumPurchase > 0 && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Min. purchase: ${parseFloat(coupon.minimumPurchase).toFixed(2)}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Hash className="w-4 h-4" />
                                  <span>
                                    Uses: {coupon.usedCount || 0}
                                    {coupon.maxUses > 0 && ` / ${coupon.maxUses}`}
                                  </span>
                                </div>
                                {coupon.expiresAt && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>Expires: {format(new Date(coupon.expiresAt), "MMM d, yyyy")}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCoupon(coupon)}
                              data-testid={`button-edit-coupon-${coupon.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              disabled={deletingCouponId === coupon.id}
                              data-testid={`button-delete-coupon-${coupon.id}`}
                            >
                              {deletingCouponId === coupon.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
