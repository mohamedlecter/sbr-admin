import { useEffect, useState } from "react";
import { Users, ShoppingCart, DollarSign, Package } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { DataTable } from "@/components/DataTable";
import { dashboardApi } from "@/lib/api";
import { toast } from "sonner";

interface DashboardStats {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  total_products: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  full_name: string;
  total_amount: string | number;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const { data, error } = await dashboardApi.getStatistics();
    
    if (error) {
      toast.error("Failed to load dashboard data");
      setLoading(false);
      return;
    }

    if (data) {
      setStats((data as any).statistics);
      setRecentOrders((data as any).recent_orders || []);
    }
    setLoading(false);
  };

  const orderColumns = [
    { key: "order_number", label: "Order #" },
    { key: "full_name", label: "Customer" },
    {
      key: "total_amount",
      label: "Amount",
      render: (value: string | number) => `$${Number(value).toFixed(2)}`,
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
      key: "created_at",
      label: "Date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to SBR Admin Panel</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={Users}
        />
        <StatCard
          title="Total Orders"
          value={stats?.total_orders || 0}
          icon={ShoppingCart}
        />
        <StatCard
          title="Revenue"
          value={`$${Number(stats?.total_revenue || 0).toFixed(2)}`}
          icon={DollarSign}
        />
        <StatCard
          title="Products"
          value={stats?.total_products || 0}
          icon={Package}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Recent Orders</h2>
        <DataTable
          columns={orderColumns}
          data={recentOrders}
          emptyMessage="No recent orders"
        />
      </div>
    </div>
  );
}
