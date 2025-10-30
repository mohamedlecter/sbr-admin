import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { usersApi } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  full_name: string;
  email: string;
  membership_type: string;
  order_count: number;
  total_spent: number;
  created_at: string;
}

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await usersApi.getAll({ page, limit: 20, search });

    if (error) {
      toast.error("Failed to load users");
      setLoading(false);
      return;
    }

    if (data) {
      setUsers((data as any).users || []);
      setPagination((data as any).pagination);
    }
    setLoading(false);
  };

  const userColumns = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "membership_type",
      label: "Membership",
      render: (value: string) => (
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {value}
        </span>
      ),
    },
    { key: "order_count", label: "Orders" },
    {
      key: "total_spent",
      label: "Total Spent",
      render: (value: number) => `$${Number(value).toFixed(2)}`,
    },
    {
      key: "created_at",
      label: "Joined",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">Manage customer accounts</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={userColumns}
          onRowClick={(item) => navigate(`/users/${item.id}`)}
          data={users}
          pagination={pagination}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
