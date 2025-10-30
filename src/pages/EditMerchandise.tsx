import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { merchandiseApi } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function EditMerchandise() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    description: "",
    price: "",
    quantity: "",
    images: "",
    size_options: "",
    color_options: "",
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data, error } = await merchandiseApi.getOne(id);
      if (error || !data) {
        toast.error(error || "Failed to load merchandise");
        setLoading(false);
        return;
      }
      const m: any = data;
      setForm({
        name: m.merchandise.name || "",
        description: m.merchandise.description || "",
        price: m.merchandise.price ?? "",
        quantity: m.merchandise.quantity ?? "",
        images: Array.isArray(m.merchandise.images) ? m.merchandise.images.join(", ") : "",
        size_options: Array.isArray(m.merchandise.size_options) ? m.merchandise.size_options.join(", ") : "",
        color_options: Array.isArray(m.merchandise.color_options) ? m.merchandise.color_options.join(", ") : "",
      });
      setLoading(false);
    };
    load();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    const payload: any = {
      name: form.name,
      description: form.description || undefined,
      price: form.price !== "" ? parseFloat(form.price) : undefined,
      quantity: form.quantity !== "" ? parseInt(form.quantity) : undefined,
      images: form.images
        ? form.images.split(",").map((s: string) => s.trim()).filter(Boolean)
        : undefined,
      color_options: form.color_options
        ? form.color_options.split(",").map((s: string) => s.trim()).filter(Boolean)
        : undefined,
      size_options: form.size_options
        ? form.size_options.split(",").map((s: string) => s.trim()).filter(Boolean)
        : undefined,
    };
    const { error } = await merchandiseApi.update(id, payload);
    if (error) {
      toast.error(error || "Failed to save merchandise");
    } else {
      toast.success("Merchandise updated");
      navigate("/products");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Merchandise</h1>
        <p className="text-muted-foreground">Update merchandise details</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </div>
        </div>
        <div>
          <Label htmlFor="images">Images (comma-separated URLs)</Label>
          <Input id="images" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="color_options">Color Options (comma-separated)</Label>
          <Input id="color_options" value={form.color_options} onChange={(e) => setForm({ ...form, color_options: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="size_options">Size Options (comma-separated)</Label>
          <Input id="size_options" value={form.size_options} onChange={(e) => setForm({ ...form, size_options: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="bg-gradient-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}


