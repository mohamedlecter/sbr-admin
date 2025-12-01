import { useEffect, useState } from "react";
import { DataTable } from "@/components/DataTable";
import { partnersApi, getImageUrl } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";

interface Partner {
  id: string;
  name: string;
  description: string | null;
  about_page: string | null;
  website_url: string | null;
  contact_email: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    about_page: "",
    website_url: "",
    contact_email: "",
    is_active: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    const { data, error } = await partnersApi.getAll();

    if (error) {
      toast.error("Failed to load partners");
      setLoading(false);
      return;
    }

    if (data) {
      const partnersData = Array.isArray(data) 
        ? data 
        : (data as any).partners || (data as any).data || [];
      setPartners(partnersData);
    } else {
      setPartners([]);
    }
    setLoading(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} is not a valid image file`);
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    if (formData.description) formDataToSend.append('description', formData.description);
    if (formData.about_page) formDataToSend.append('about_page', formData.about_page);
    if (formData.website_url) formDataToSend.append('website_url', formData.website_url);
    if (formData.contact_email) formDataToSend.append('contact_email', formData.contact_email);
    formDataToSend.append('is_active', formData.is_active.toString());

    // Append logo file if new one is selected
    if (logoFile) {
      formDataToSend.append('logo', logoFile);
    } else if (editingPartner && editingPartner.logo_url && !logoFile) {
      // Keep existing logo if editing and no new file selected
      formDataToSend.append('logo_url', editingPartner.logo_url);
    }

    const { error } = editingPartner
      ? await partnersApi.update(editingPartner.id, formDataToSend)
      : await partnersApi.create(formDataToSend);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success(`Partner ${editingPartner ? "updated" : "created"} successfully`);
    setIsDialogOpen(false);
    resetForm();
    loadPartners();
  };

  const resetForm = () => {
    setEditingPartner(null);
    setFormData({
      name: "",
      description: "",
      about_page: "",
      website_url: "",
      contact_email: "",
      is_active: true,
    });
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      description: partner.description || "",
      about_page: partner.about_page || "",
      website_url: partner.website_url || "",
      contact_email: partner.contact_email || "",
      is_active: partner.is_active,
    });
    if (partner.logo_url) {
      setLogoPreview(getImageUrl(partner.logo_url));
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;

    const { error } = await partnersApi.delete(id);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Partner deleted successfully");
    loadPartners();
  };

  const partnerColumns = [
    { key: "name", label: "Name" },
    { 
      key: "logo_url", 
      label: "Logo",
      render: (value: string | null) => {
        if (!value) return <span className="text-muted-foreground">No logo</span>;
        return (
          <img 
            src={getImageUrl(value)} 
            alt="Partner logo" 
            className="h-10 w-10 object-contain rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      },
    },
    { key: "website_url", label: "Website" },
    { key: "contact_email", label: "Email" },
    {
      key: "is_active",
      label: "Status",
      render: (value: boolean) => (
        <span className={value ? "text-green-600" : "text-gray-500"}>
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: "id",
      label: "Actions",
      render: (_: any, partner: Partner) => (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(partner)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(partner.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Partners</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage business partners</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPartner ? "Edit Partner" : "Add New Partner"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Partner Name *</Label>
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
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="about_page">About Page</Label>
                <Textarea
                  id="about_page"
                  value={formData.about_page}
                  onChange={(e) =>
                    setFormData({ ...formData, about_page: e.target.value })
                  }
                  rows={4}
                  placeholder="Detailed information about the partner"
                />
              </div>
              <div>
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) =>
                    setFormData({ ...formData, website_url: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_email: e.target.value })
                  }
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <Label htmlFor="logo">Logo</Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="cursor-pointer"
                    />
                  </div>
                  {logoPreview && (
                    <div className="relative inline-block">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-24 w-24 object-contain border rounded-md p-2"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeLogo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked === true })
                  }
                />
                <Label
                  htmlFor="is_active"
                  className="text-sm font-normal cursor-pointer"
                >
                  Active
                </Label>
              </div>
              <Button type="submit" className="w-full bg-gradient-primary">
                {editingPartner ? "Update" : "Create"} Partner
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
        <DataTable columns={partnerColumns} data={partners} />
      )}
    </div>
  );
}

