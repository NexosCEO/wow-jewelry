import { useQuery, useMutation } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Package, Printer, Mail, ExternalLink, Lock, LogOut } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAdminToken, setAdminToken, isAdminAuthenticated, clearAdminToken } from "@/lib/adminAuth";
import { useState } from "react";

export default function Admin() {
  const { toast } = useToast();
  const [accessKey, setAccessKey] = useState(getAdminToken() || "");
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminAuthenticated());

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminToken(accessKey);
    setIsAuthenticated(true);
    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
    setAccessKey("");
  };

  const generateLabelMutation = useMutation({
    mutationKey: ["generate-shipping-label"],
    mutationFn: async (orderId: string) => {
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
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Label Generated!",
        description: "Shipping label is ready to print",
      });
      if (data.labelUrl) {
        window.open(data.labelUrl, "_blank");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate shipping label",
        variant: "destructive",
      });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationKey: ["send-notification"],
    mutationFn: async (orderId: string) => {
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
      toast({
        title: "Notification Sent!",
        description: "Customer has been notified",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Admin Access Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="access-key" className="text-sm font-medium mb-2 block">
                  Access Key
                </label>
                <Input
                  id="access-key"
                  type="password"
                  placeholder="Enter admin access key"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  data-testid="input-admin-key"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="button-admin-login">
                Access Admin Dashboard
              </Button>
            </form>
            {error && (
              <p className="text-sm text-destructive mt-4" data-testid="text-auth-error">
                Invalid access key. Please try again.
              </p>
            )}
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
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-bold mb-2" data-testid="text-admin-title">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground" data-testid="text-admin-subtitle">
              Manage orders and generate shipping labels
            </p>
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
                    <div className="flex gap-2">
                      <Badge data-testid={`badge-status-${order.id}`}>
                        {order.status}
                      </Badge>
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
                        <div className="pt-2 border-t border-border flex justify-between font-semibold">
                          <span>Total</span>
                          <span data-testid={`text-order-total-${order.id}`}>
                            ${parseFloat(order.totalAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

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

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => generateLabelMutation.mutate(order.id)}
                      disabled={generateLabelMutation.isPending}
                      className="flex-1 sm:flex-none"
                      data-testid={`button-generate-label-${order.id}`}
                    >
                      {generateLabelMutation.isPending ? (
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
                      variant="outline"
                      onClick={() => sendNotificationMutation.mutate(order.id)}
                      disabled={sendNotificationMutation.isPending}
                      className="flex-1 sm:flex-none"
                      data-testid={`button-notify-customer-${order.id}`}
                    >
                      {sendNotificationMutation.isPending ? (
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
      </div>
    </div>
  );
}
