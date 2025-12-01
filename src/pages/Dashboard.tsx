import { useEffect, useState } from "react";
import { Users, ShoppingCart, DollarSign, Package, TrendingUp, UsersRound, TrendingDown, Minus, AlertCircle, CreditCard } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { dashboardApi } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend as RechartsLegend } from "recharts";

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

interface TopProduct {
  name: string;
  manufacturer_name: string;
  total_sold: string;
}

interface MembershipDistribution {
  membership_type: string;
  count: number;
}

interface RevenueTrend {
  date?: string;
  week?: string;
  month?: string;
  revenue: number;
  orders: number;
}

interface RevenueTrends {
  daily: RevenueTrend[];
  weekly: RevenueTrend[];
  monthly: RevenueTrend[];
}

interface StatusDistribution {
  status: string;
  count: number;
  percentage?: number;
  amount?: number;
}

interface GrowthMetric {
  current: number;
  previous: number;
  change_percent: number;
  trend: "up" | "down" | "neutral";
}

interface GrowthMetrics {
  users: GrowthMetric;
  orders: GrowthMetric;
  revenue: GrowthMetric;
  period: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [membershipDistribution, setMembershipDistribution] = useState<MembershipDistribution[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrends | null>(null);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState<StatusDistribution[]>([]);
  const [paymentStatusDistribution, setPaymentStatusDistribution] = useState<StatusDistribution[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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
      setTopProducts((data as any).top_products || []);
      setMembershipDistribution((data as any).membership_distribution || []);
      setRevenueTrends((data as any).revenue_trends || null);
      setOrderStatusDistribution((data as any).order_status_distribution || []);
      setPaymentStatusDistribution((data as any).payment_status_distribution || []);
      setGrowthMetrics((data as any).growth_metrics || null);
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

  // Helper functions
  function getMembershipColor(type: string): string {
    const colors: Record<string, string> = {
      silver: "hsl(210, 20%, 75%)",
      gold: "hsl(45, 93%, 58%)",
      platinum: "hsl(220, 70%, 50%)",
      bronze: "hsl(25, 95%, 53%)",
    };
    return colors[type.toLowerCase()] || "hsl(var(--primary))";
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: "hsl(var(--warning))",
      processing: "hsl(var(--primary))",
      shipped: "hsl(220, 70%, 50%)",
      delivered: "hsl(var(--success))",
      cancelled: "hsl(var(--destructive))",
      paid: "hsl(var(--success))",
      unpaid: "hsl(var(--warning))",
      refunded: "hsl(var(--destructive))",
    };
    return colors[status.toLowerCase()] || "hsl(var(--muted))";
  }

  function formatTrendPercent(value: number): string {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  }

  function getTrendIcon(trend: "up" | "down" | "neutral") {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4" />;
      case "down":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  }

  function getTrendColor(trend: "up" | "down" | "neutral", percent: number) {
    if (trend === "neutral" || percent === 0) return "text-muted-foreground";
    return trend === "up" ? "text-success" : "text-destructive";
  }

  // Prepare chart data - limit to top 5 and use shorter names
  const topProductsChartData = topProducts
    .slice(0, 5)
    .map((product) => ({
      name: product.name.length > 18 ? product.name.substring(0, 15) + "..." : product.name,
      fullName: product.name,
      manufacturer: product.manufacturer_name,
      sold: Number(product.total_sold),
    }));

  const membershipChartData = membershipDistribution.map((member) => ({
    name: member.membership_type.charAt(0).toUpperCase() + member.membership_type.slice(1),
    value: member.count,
    fill: getMembershipColor(member.membership_type),
  }));

  const orderStatusChartData = orderStatusDistribution.map((status) => ({
    name: status.status.charAt(0).toUpperCase() + status.status.slice(1),
    value: status.count,
    percentage: status.percentage || 0,
    fill: getStatusColor(status.status),
  }));

  const paymentStatusChartData = paymentStatusDistribution.map((payment) => ({
    name: payment.status.charAt(0).toUpperCase() + payment.status.slice(1),
    value: payment.count,
    amount: payment.amount || 0,
    fill: getStatusColor(payment.status),
  }));

  // Format revenue trends for display (use daily for now)
  const revenueTrendChartData = revenueTrends?.daily.map((trend) => ({
    date: trend.date ? new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : trend.date,
    revenue: trend.revenue,
    orders: trend.orders,
  })) || [];

  const revenueTrendConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--success))",
    },
  };

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

      {/* Statistics Cards with Growth Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
            {growthMetrics && (
              <div className={`flex items-center gap-1 text-xs ${getTrendColor(growthMetrics.users.trend, growthMetrics.users.change_percent)}`}>
                {getTrendIcon(growthMetrics.users.trend)}
                <span>{formatTrendPercent(growthMetrics.users.change_percent)}</span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_orders || 0}</div>
            {growthMetrics && (
              <div className={`flex items-center gap-1 text-xs ${getTrendColor(growthMetrics.orders.trend, growthMetrics.orders.change_percent)}`}>
                {getTrendIcon(growthMetrics.orders.trend)}
                <span>{formatTrendPercent(growthMetrics.orders.change_percent)}</span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Number(stats?.total_revenue || 0).toFixed(2)}</div>
            {growthMetrics && (
              <div className={`flex items-center gap-1 text-xs ${getTrendColor(growthMetrics.revenue.trend, growthMetrics.revenue.change_percent)}`}>
                {getTrendIcon(growthMetrics.revenue.trend)}
                <span>{formatTrendPercent(growthMetrics.revenue.change_percent)}</span>
                <span className="text-muted-foreground">vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_products || 0}</div>
            <p className="text-xs text-muted-foreground">Total products in catalog</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends and Top Products Side by Side */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trends Chart */}
        {revenueTrendChartData.length > 0 ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-4 w-4" />
                Revenue Trends
              </CardTitle>
              <CardDescription className="text-xs">Daily revenue and orders over time</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer config={revenueTrendConfig} className="h-[250px]">
                <LineChart data={revenueTrendChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 11 }}
                    width={40}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    width={40}
                    className="text-muted-foreground"
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <div className="font-medium mb-2">{payload[0].payload.date}</div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                                <span className="text-sm">Revenue: ${Number(payload[0].value).toFixed(2)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-success" />
                                <span className="text-sm">Orders: {payload[1]?.value}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <RechartsLegend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Revenue ($)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="orders" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Orders"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-4 w-4" />
                Revenue Trends
              </CardTitle>
              <CardDescription className="text-xs">Daily revenue and orders over time</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
                No revenue trend data available
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Products Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-4 w-4" />
              Top Products
            </CardTitle>
            <CardDescription className="text-xs">Best selling products by units sold</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {topProductsChartData.length > 0 ? (
              <ChartContainer config={{ sold: { label: "Units Sold", color: "hsl(var(--primary))" } }} className="h-[250px]">
                <BarChart data={topProductsChartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 10 }}
                    interval={0}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    width={40}
                    className="text-muted-foreground"
                  />
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-lg text-xs">
                            <div className="font-medium text-sm">{data.fullName}</div>
                            <div className="text-muted-foreground">Manufacturer: {data.manufacturer}</div>
                            <div className="font-semibold text-primary">
                              Units Sold: {data.sold}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="sold" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Order Status Distribution
            </CardTitle>
            <CardDescription>Breakdown of orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            {orderStatusChartData.length > 0 ? (
              <ChartContainer config={{}} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={orderStatusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value, percentage }) => `${name}\n${value} (${percentage}%)`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <div className="font-medium">{data.name}</div>
                            <div className="text-sm font-semibold text-primary">
                              Count: {data.value}
                            </div>
                            {data.payload.percentage && (
                              <div className="text-xs text-muted-foreground">
                                {data.payload.percentage}% of total
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No order status data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Status Distribution
            </CardTitle>
            <CardDescription>Breakdown of payments by status</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentStatusChartData.length > 0 ? (
              <ChartContainer config={{}} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={paymentStatusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value, amount }) => `${name}\n${value} orders`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <div className="font-medium">{data.name}</div>
                            <div className="text-sm font-semibold text-primary">
                              Orders: {data.value}
                            </div>
                            {data.payload.amount !== undefined && (
                              <div className="text-xs text-muted-foreground">
                                Amount: ${Number(data.payload.amount).toFixed(2)}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No payment data available
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Recent Orders */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Recent Orders</h2>
        <DataTable
          columns={orderColumns}
          data={recentOrders}
          emptyMessage="No recent orders"
          onRowClick={(item) => navigate(`/orders/${item.id}`)}
        />
      </div>
    </div>
  );
}
