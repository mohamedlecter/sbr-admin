import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { ordersApi } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;
  order_number: string;
  full_name: string;
  email: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [page, status]);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error } = await ordersApi.getAll({ 
      page, 
      limit: 20, 
      ...(status && { status })
    });

    if (error) {
      toast.error("Failed to load orders");
      setLoading(false);
      return;
    }

    if (data) {
      setOrders((data as any).orders || []);
      setPagination((data as any).pagination);
    }
    setLoading(false);
  };

  const orderColumns = [
    { key: "order_number", label: "Order #" },
    { key: "full_name", label: "Customer" },
    { key: "email", label: "Email" },
    {
      key: "total_amount",
      label: "Amount",
      render: (value: number) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            value === "delivered"
              ? "bg-success/10 text-success"
              : value === "cancelled"
              ? "bg-destructive/10 text-destructive"
              : value === "shipped"
              ? "bg-primary/10 text-primary"
              : "bg-warning/10 text-warning"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "payment_status",
      label: "Payment",
      render: (value: string) => (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          value === "paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">Track and manage customer orders</p>
      </div>

      <div className="flex gap-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={orderColumns}
          data={orders}
          pagination={pagination}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
