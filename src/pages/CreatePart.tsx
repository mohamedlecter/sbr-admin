import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { partsApi, brandsApi, categoriesApi } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, ArrowLeft, ArrowLeftIcon } from "lucide-react";

interface Brand { id: string; name: string }
interface Category { id: string; name: string }

export default function CreatePart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
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

  const [newBrandName, setNewBrandName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    const load = async () => {
      const [brandsResult, categoriesResult] = await Promise.all([
        brandsApi.getAll(),
        categoriesApi.getAll(),
      ]);

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
  }, []);

  const ensureBrandAndCategory = async () => {
    let brandId = form.brand_id;
    let categoryId = form.category_id;

    if (brandId === "new") {
      if (!newBrandName.trim()) {
        toast.error("Brand name is required");
        return { ok: false };
      }
      const { data: brandData, error } = await brandsApi.create({ name: newBrandName });
      if (error || !brandData) {
        toast.error(error || "Failed to create brand");
        return { ok: false };
      }
      let newBrandId = (brandData as any).id || (brandData as any).brand?.id || (brandData as any).data?.id;
      if (!newBrandId) {
        toast.error("Failed to get brand ID from response");
        return { ok: false };
      }
      brandId = newBrandId;
      setForm((f) => ({ ...f, brand_id: newBrandId }));
      setNewBrandName("");
      const refreshed = await brandsApi.getAll();
      if (refreshed.data) {
        const brandsData = Array.isArray(refreshed.data)
          ? refreshed.data
          : (refreshed.data as any).brands || (refreshed.data as any).data || [];
        setBrands(brandsData);
      }
      toast.success("Brand created");
    }

    if (categoryId === "new") {
      if (!newCategoryName.trim()) {
        toast.error("Category name is required");
        return { ok: false };
      }
      const { data: categoryData, error } = await categoriesApi.create({ name: newCategoryName });
      if (error || !categoryData) {
        toast.error(error || "Failed to create category");
        return { ok: false };
      }
      let newCategoryId = (categoryData as any).id || (categoryData as any).category?.id || (categoryData as any).data?.id;
      if (!newCategoryId) {
        toast.error("Failed to get category ID from response");
        return { ok: false };
      }
      categoryId = newCategoryId;
      setForm((f) => ({ ...f, category_id: newCategoryId }));
      setNewCategoryName("");
      const refreshed = await categoriesApi.getAll();
      if (refreshed.data) {
        const categoriesData = Array.isArray(refreshed.data)
          ? refreshed.data
          : (refreshed.data as any).categories || (refreshed.data as any).data || [];
        setCategories(categoriesData);
      }
      toast.success("Category created");
    }

    return { ok: true, brandId, categoryId } as const;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const ensured = await ensureBrandAndCategory();
    if (!ensured.ok) {
      setSubmitting(false);
      return;
    }

    if (!ensured.brandId || !ensured.categoryId) {
      toast.error("Please select brand and category");
      setSubmitting(false);
      return;
    }

    const images = form.images ? form.images.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const colorOptions = form.color_options ? form.color_options.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const compatibility = form.compatibility ? form.compatibility.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const payload: any = {
      brand_id: ensured.brandId,
      category_id: ensured.categoryId,
      name: form.name,
      description: form.description || undefined,
      original_price: form.original_price !== "" ? parseFloat(form.original_price) : undefined,
      selling_price: form.selling_price !== "" ? parseFloat(form.selling_price) : undefined,
      quantity: form.quantity !== "" ? parseInt(form.quantity) : undefined,
      weight: form.weight !== "" ? parseFloat(form.weight) : undefined,
      images: images.length ? images : undefined,
      color_options: colorOptions.length ? colorOptions : undefined,
      compatibility: compatibility.length ? compatibility : undefined,
    };

    const { error } = await partsApi.create(payload);
    if (error) {
      toast.error(error || "Failed to create part");
      setSubmitting(false);
      return;
    }
    toast.success("Part created successfully");
    navigate("/products");
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
        <div className="flex items-center cursor-pointer hover:underline text-primary align-middle" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 align-middle" />  
          <h1 className="text-2xl font-bold text-foreground ml-2 hover:underline">Create Part</h1>
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
                <Label htmlFor="brand_id">Brand *</Label>
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
                <Label htmlFor="category_id">Category *</Label>
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

            <div>
              <Label htmlFor="name">Part Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="original_price">Original Price *</Label>
                <Input id="original_price" type="number" step="0.01" min="0" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="selling_price">Selling Price *</Label>
                <Input id="selling_price" type="number" step="0.01" min="0" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input id="quantity" type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="weight">Weight (Kg)</Label>
                <Input id="weight" type="number" step="0.01" min="0" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              </div>
            </div>

            <div>
              <Label htmlFor="images">Images (comma-separated URLs)</Label>
              <Input id="images" placeholder="https://... , https://..." value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="color_options">Color Options (comma-separated)</Label>
                <Input id="color_options" placeholder="Black, Red, ..." value={form.color_options} onChange={(e) => setForm({ ...form, color_options: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="compatibility">Compatibility (comma-separated models)</Label>
                <Input id="compatibility" placeholder="Model A, Model B" value={form.compatibility} onChange={(e) => setForm({ ...form, compatibility: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">

              <Button className="w-full md:w-1/4 bg-gradient-primary mb-2" onClick={onSubmit as any} disabled={submitting}>
                {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>) : (<>Create</>)}
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
    </div>
  );
}


