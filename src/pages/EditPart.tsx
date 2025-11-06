import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { brandsApi, categoriesApi, partsApi } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, Loader2 } from "lucide-react";
import { Select, SelectValue, SelectItem, SelectContent, SelectTrigger } from "@/components/ui/select";

interface Brand { id: string; name: string }
interface Category { id: string; name: string }

export default function EditPart() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    brand_id: "",
    category_id: "",
    name: "",
    description: "",
    original_price: "",
    selling_price: "",
    quantity: "",
    weight: "",
    images: "",
    color_options: "",
    compatibility: "",
  });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newBrandName, setNewBrandName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const [partsResult, brandsResult, categoriesResult] = await Promise.all([
        partsApi.getOne(id),
        brandsApi.getAll(),
        categoriesApi.getAll(),
      ]);

      console.log("partsResult", partsResult);  
      if (partsResult.error || !partsResult.data) {
        toast.error(partsResult.error || "Failed to load part");
        setLoading(false);
        return;
      }
      const p: any = partsResult.data;
      setForm({
        name: p.part.name || "",
        description: p.part.description || "",
        original_price: p.part.original_price ?? "",
        selling_price: p.part.selling_price ?? "",
        quantity: p.part.quantity ?? "",
        weight: p.part.weight ?? "",
        images: Array.isArray(p.part.images) ? p.part.images.join(", ") : p.part.images || "",
        color_options: Array.isArray(p.part.color_options) ? p.part.color_options.join(", ") : p.part.color_options || "",
        compatibility: Array.isArray(p.part.compatibility) ? p.part.compatibility.join(", ") : p.part.compatibility || "",
      });      
      if (brandsResult.data) {
        const brandsData = Array.isArray(brandsResult.data)
          ? brandsResult.data
          : (brandsResult.data as any).brands || (brandsResult.data as any).data || [];
        setBrands(brandsData);
      }
      if (categoriesResult.data) {
        const categoriesData = Array.isArray(categoriesResult.data)
          ? categoriesResult.data
          : (categoriesResult.data as any).categories || (categoriesResult.data as any).data || [];
        setCategories(categoriesData);
      }
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
    console.log("payload", payload);
    const { error } = await partsApi.update(id, payload);
    console.log("error", error);
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
          <h1 className="text-3xl font-bold text-foreground ml-2 hover:underline">Edit Part</h1>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>
                <Label htmlFor="brand_id">Brand</Label>
                <Select value={form.brand_id} onValueChange={(v) => setForm({ ...form, brand_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Create New Brand</SelectItem>
                    {brands.map((b) => (
                      <SelectItem value={b.id} key={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.brand_id === "new" && (
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <Input placeholder="Brand name" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="category_id">Category</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Create New Category</SelectItem>
                    {categories.map((c) => (
                      <SelectItem value={c.id} key={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.category_id === "new" && (
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <Input placeholder="Category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="original_price">Original Price</Label>
                <Input id="original_price" type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="selling_price">Selling Price</Label>
                <Input id="selling_price" type="number" step="0.01" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
                <Label htmlFor="color_options">Color Options (comma-separated)</Label>
                <Input id="color_options" value={form.color_options} onChange={(e) => setForm({ ...form, color_options: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="compatibility">Compatibility (comma-separated)</Label>
                <Input id="compatibility" value={form.compatibility} onChange={(e) => setForm({ ...form, compatibility: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="images">Images (comma-separated URLs)</Label>
                <Input id="images" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="w-full md:w-1/4 bg-gradient-primary mb-2" onClick={onSubmit as any} disabled={saving}>
                {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : (<>Save</>)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
