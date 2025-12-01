import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { usersApi } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data, error } = await usersApi.getOne(id);
      if (error || !data) {
        toast.error(error || "Failed to load user");
        setLoading(false);
        return;
      }
      setData(data);
      setLoading(false);
    };
    load();
  }, [id]);

  const user = data?.user;
  const orders = Array.isArray(data?.orders) ? data.orders : [];
  const orderItems = Array.isArray(data?.orderItems) ? data.orderItems : [];
  const payments = Array.isArray(data?.payments) ? data.payments : [];

  const totalSpent = useMemo(() => orders.reduce((sum: number, o: any) => sum + parseFloat(o.total_amount || 0), 0), [orders]);
  const totalOrders = orders.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate(-1)} className="inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-muted-foreground">User not found.</p>
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
            <CardTitle className="text-lg sm:text-xl">User Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="text-muted-foreground">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Phone</div>
                <div className="font-medium">{user.phone || '-'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Membership</div>
                <div className="flex items-center gap-2">
                  <Badge>{user.membership_type}</Badge>
                  <span className="text-sm text-muted-foreground">{user.membership_points} pts</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">Verification</div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.email_verified ? 'default' : 'secondary'}>Email {user.email_verified ? 'verified' : 'unverified'}</Badge>
                  <Badge variant={user.phone_verified ? 'default' : 'secondary'}>Phone {user.phone_verified ? 'verified' : 'unverified'}</Badge>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Joined {new Date(user.created_at).toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-medium">{totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Spent</span>
                <span className="font-bold">${totalSpent.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>


      </div>
     

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o: any) => (
                  <TableRow key={o.id} className="cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
                    <TableCell className="text-primary"><Link to={`/orders/${o.id}`}>{o.order_number}</Link></TableCell>
                    <TableCell><Badge variant="secondary">{o.status}</Badge></TableCell>
                    <TableCell><Badge variant={o.payment_status === 'paid' ? 'default' : 'secondary'}>{o.payment_status}</Badge></TableCell>
                    <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">${parseFloat(o.total_amount || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No orders</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

          
          {/* <Card>
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
        </Card> */}
    </div>


  );
}


