import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { productsApi } from "@/lib/api";
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

interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  merch_price: number;
  quantity: number;
  is_active: boolean;
  brand_name: string;
  category_name: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [page, search, type]);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await productsApi.getAll({ 
      page, 
      limit: 20, 
      search,
      ...(type && { type })
    });

    if (error) {
      toast.error("Failed to load products");
      setLoading(false);
      return;
    }

    if (data) {
      setProducts((data as any).products || []);
      setPagination((data as any).pagination);
    }
    setLoading(false);
  };

  const productColumns = [
    { key: "name", label: "Name" },
    {
      key: "type",
      label: "Type",
      render: (value: string) => (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          value === "part" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent-foreground"
        }`}>
          {value}
        </span>
      ),
    },
    { key: "brand_name", label: "Brand" },
    { key: "category_name", label: "Category" },
    {
      key: "price",
      label: "Price",
      render: (value: number, item: Product) => 
        `$${Number(item.type === "part" ? value : item.merch_price).toFixed(2)}`,
    },
    { key: "quantity", label: "Stock" },
    {
      key: "is_active",
      label: "Status",
      render: (value: boolean) => (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          value ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
        }`}>
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground">Manage parts and merchandise</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="part">Parts</SelectItem>
            <SelectItem value="merch">Merchandise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={productColumns}
          data={products}
          pagination={pagination}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
