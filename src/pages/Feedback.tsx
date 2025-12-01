import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { feedbackApi } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
interface Feedback {
  id: string;
  full_name: string;
  email: string;
  feedback_type: string;
  message: string;
  created_at: string;
}

export default function Feedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    loadFeedback();
  }, [page]);

  const loadFeedback = async () => {
    setLoading(true);
    const { data, error } = await feedbackApi.getAll({ page, limit: 20 });

    if (error) {
      toast.error("Failed to load feedback");
      setLoading(false);
      return;
    }

    if (data) {
      setFeedback((data as any).feedback || []);
      setPagination((data as any).pagination);
    }
    setLoading(false);
  };

  const feedbackColumns = [
    { key: "full_name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "feedback_type",
      label: "Type",
      render: (value: string) => (
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {value}
        </span>
      ),
    },
    { key: "message", label: "Message" },
    {
      key: "created_at",
      label: "Date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Feedback</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Review customer feedback</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={feedbackColumns}
          data={feedback}
          pagination={pagination}
          onPageChange={setPage}
          onRowClick={(item) => navigate(`/feedback/${item.id}`)}
        />
      )}
    </div>
  );
}
