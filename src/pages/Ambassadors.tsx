import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { ambassadorsApi } from "@/lib/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
interface Ambassador {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  social_media_links: any;
  motivation: string;
  created_at: string;
}

export default function Ambassadors() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    loadAmbassadors();
  }, [page, status]);

  const loadAmbassadors = async () => {
    setLoading(true);
    const { data, error } = await ambassadorsApi.getAll({ 
      page, 
      limit: 20,
      ...(status && { status })
    });

    if (error) {
      toast.error("Failed to load ambassadors");
      setLoading(false);
      return;
    }

    if (data) {
      setAmbassadors((data as any).ambassadors || []);
      setPagination((data as any).pagination);
    }
    setLoading(false);
  };

  const ambassadorColumns = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            value === "approved"
              ? "bg-success/10 text-success"
              : value === "rejected"
              ? "bg-destructive/10 text-destructive"
              : "bg-warning/10 text-warning"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Applied",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ambassadors</h1>
        <p className="text-muted-foreground">Manage ambassador applications</p>
      </div>

      <div className="flex gap-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={ambassadorColumns}
          data={ambassadors}
          pagination={pagination}
          onPageChange={setPage}
          onRowClick={(item) => navigate(`/ambassadors/${item.id}`)}
        />
      )}
    </div>
  );
}
