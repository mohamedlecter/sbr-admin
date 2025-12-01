import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { manufacturersApi } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Manufacturer {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  created_at: string;
}

export default function Manufacturers() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo_url: "",
  });

  useEffect(() => {
    loadManufacturers();
  }, []);

  const loadManufacturers = async () => {
    setLoading(true);
    const { data, error } = await manufacturersApi.getAll();

    if (error) {
      toast.error("Failed to load manufacturers");
      setLoading(false);
      return;
    }

    if (data) {
      // Handle both array response and object with manufacturers property
      const manufacturersData = Array.isArray(data) 
        ? data 
        : (data as any).manufacturers || (data as any).data || [];
        setManufacturers(manufacturersData);
    } else {
      setManufacturers([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = editingManufacturer
      ? await manufacturersApi.update(editingManufacturer.id, new FormData(formData as any))
      : await manufacturersApi.create(new FormData(formData as any));

    if (error) {
      toast.error(error);
      return;
    }

    toast.success(`Manufacturer ${editingManufacturer ? "updated" : "created"} successfully`);
    setIsDialogOpen(false);
    setEditingManufacturer(null);
    setFormData({ name: "", description: "", logo_url: "" });
    loadManufacturers();
  };

  const handleEdit = (manufacturer: Manufacturer) => {
    setEditingManufacturer(manufacturer);
    setFormData({
      name: manufacturer.name,
      description: manufacturer.description || "",
      logo_url: manufacturer.logo_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this manufacturer?")) return;

    const { error } = await manufacturersApi.delete(id);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Manufacturer deleted successfully");
    loadManufacturers();
  };

  const manufacturerColumns = [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
    {
      key: "created_at",
      label: "Created",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "id",
      label: "Actions",
      render: (_: any, manufacturer: Manufacturer) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(manufacturer)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(manufacturer.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manufacturers</h1>
          <p className="text-muted-foreground">Manage motorcycle manufacturers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Manufacturer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingManufacturer ? "Edit Manufacturer" : "Add New Manufacturer"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Manufacturer Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, logo_url: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary">
                {editingManufacturer ? "Update" : "Create"} Manufacturer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable columns={manufacturerColumns} data={manufacturers} />
      )}
    </div>
  );
}
