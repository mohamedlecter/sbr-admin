import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { partsApi } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon } from "lucide-react";

export default function EditPart() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    name: "",
    description: "",
    selling_price: "",
    quantity: "",
    images: "",
    color_options: "",
    compatibility: "",
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data, error } = await partsApi.getOne(id);

      console.log("data", data);
      if (error || !data) {
        toast.error(error || "Failed to load part");
        setLoading(false);
        return;
      }
      const p: any = data;
      console.log("p", p);
      setForm({
        name: p.part.name || "",
        description: p.part.description || "",
        selling_price: p.part.selling_price ?? "",
        quantity: p.part.quantity ?? "",
        images: Array.isArray(p.part.images) ? p.part.images.join(", ") : "",
        color_options: Array.isArray(p.part.color_options) ? p.part.color_options.join(", ") : "",
        compatibility: Array.isArray(p.part.compatibility) ? p.part.compatibility.join(", ") : "",
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
      selling_price: form.selling_price !== "" ? parseFloat(form.selling_price) : undefined,
      quantity: form.quantity !== "" ? parseInt(form.quantity) : undefined,
      images: form.images
        ? form.images.split(",").map((s: string) => s.trim()).filter(Boolean)
        : undefined,
      color_options: form.color_options
        ? form.color_options.split(",").map((s: string) => s.trim()).filter(Boolean)
        : undefined,
      compatibility: form.compatibility
        ? form.compatibility.split(",").map((s: string) => s.trim()).filter(Boolean)
        : undefined,
    };
    const { error } = await partsApi.update(id, payload);
    if (error) {
      toast.error(error || "Failed to save part");
    } else {
      toast.success("Part updated");
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
        <div className="flex items-center cursor-pointer hover:underline text-primary" onClick={() => navigate(-1)}>
          <ArrowLeftIcon className="w-6 h-6" />  
          <h1 className="text-2xl font-bold text-foreground ml-2 hover:underline">Edit Part</h1>
        </div>
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
            <Label htmlFor="selling_price">Selling Price</Label>
            <Input id="selling_price" type="number" step="0.01" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} />
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
          <Label htmlFor="compatibility">Compatibility (comma-separated)</Label>
          <Input id="compatibility" value={form.compatibility} onChange={(e) => setForm({ ...form, compatibility: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="bg-gradient-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}


