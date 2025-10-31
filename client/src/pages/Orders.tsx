import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package } from "lucide-react";
import { format } from "date-fns";

export default function Orders() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loader-orders" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="font-serif text-4xl font-bold mb-8" data-testid="text-orders-title">Order Management</h1>

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
            return (
              <Card key={order.id} data-testid={`card-order-${order.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl" data-testid={`text-order-id-${order.id}`}>
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1" data-testid={`text-order-date-${order.id}`}>
                        {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <Badge data-testid={`badge-status-${order.id}`}>
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
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
                          <div key={index} className="flex justify-between text-sm" data-testid={`order-item-${order.id}-${index}`}>
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
