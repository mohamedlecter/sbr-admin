import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ordersApi } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data, error } = await ordersApi.getOne(id);
      if (error || !data) {
        toast.error(error || "Failed to load order");
        setLoading(false);
        return;
      }
      setData(data);
      setLoading(false);
    };
    load();
  }, [id]);

  const order = data?.order;
  const items = Array.isArray(data?.orderItems) ? data.orderItems : [];
  const payments = Array.isArray(data?.payments) ? data.payments : [];
  const address = data?.shippingAddress;

  const totalQuantity = useMemo(() => items.reduce((sum: number, it: any) => sum + (it.quantity || 0), 0), [items]);
  const computedTotal = useMemo(() => {
    const sum = items.reduce((acc: number, it: any) => acc + (parseFloat(it.price || 0) * (it.quantity || 0)), 0);
    return sum;
  }, [items]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate(-1)} className="inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-muted-foreground">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <button className="inline-flex items-center text-sm text-primary hover:underline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </button>
        <div className="w-10" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Order {order.order_number}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((it: any) => {
                  const name = it.product_type === 'part' ? it.part_name : it.merchandise_name;
                  const price = parseFloat(it.price || 0);
                  const subtotal = price * (it.quantity || 0);
                  return (
                    <TableRow key={it.id}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{it.product_type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{it.quantity}</TableCell>
                      <TableCell className="text-right">${price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No items</TableCell>
                  </TableRow>
                )}
                {items.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell className="text-right font-medium">{totalQuantity}</TableCell>
                    <TableCell className="text-right font-medium">Total</TableCell>
                    <TableCell className="text-right font-bold">${computedTotal.toFixed(2)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-medium">{order.order_number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge>{order.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment</span>
                <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                  {order.payment_status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold">${parseFloat(order.total_amount || 0).toFixed(2)}</span>
              </div>
              {order.tracking_number && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tracking #</span>
                  <span className="font-medium">{order.tracking_number}</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Created {new Date(order.created_at).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              {address ? (
                <div className="space-y-1">
                  <div className="font-medium">{address.label}</div>
                  <div>{address.street}</div>
                  <div>{address.city}, {address.country} {address.postal_code}</div>
                </div>
              ) : (
                <div className="text-muted-foreground">No shipping address</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-muted-foreground">No payments</div>
              ) : (
                <div className="space-y-3">
                  {payments.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">{p.method}</div>
                        <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={p.status === 'completed' ? 'default' : 'secondary'}>{p.status}</Badge>
                        <div className="font-medium">${parseFloat(p.amount || 0).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

