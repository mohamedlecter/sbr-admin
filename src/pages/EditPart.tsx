import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { manufacturersApi, categoriesApi, partsApi, getImageUrl } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon, Loader2, Upload, X } from "lucide-react";
import { Select, SelectValue, SelectItem, SelectContent, SelectTrigger } from "@/components/ui/select";

interface Manufacturer { id: string; name: string }
interface Category { id: string; name: string }

export default function EditPart() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    manufacturer_id: "",
    category_id: "",
    name: "",
    description: "",
    original_price: "",
    selling_price: "",
    quantity: "",
    weight: "",
    color_options: "",
    compatibility: "",
  });
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newManufacturerName, setNewManufacturerName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const [partsResult, manufacturersResult, categoriesResult] = await Promise.all([
        partsApi.getOne(id),
        manufacturersApi.getAll(),
        categoriesApi.getAll(),
      ]);

      console.log("partsResult", partsResult);  
      if (partsResult.error || !partsResult.data) {
        toast.error(partsResult.error || "Failed to load part");
        setLoading(false);
        return;
      }
      const p: any = partsResult.data;
      const images = Array.isArray(p.part.images) ? p.part.images : (p.part.images ? [p.part.images] : []);
      // Convert relative paths to full URLs
      const imageUrls = images.map((img: string) => getImageUrl(img));
      setExistingImages(images); // Keep original paths for backend
      setImagePreviews(imageUrls); // Use full URLs for display
      setForm({
        name: p.part.name || "",
        description: p.part.description || "",
        original_price: p.part.original_price ?? "",
        selling_price: p.part.selling_price ?? "",
        quantity: p.part.quantity ?? "",
        weight: p.part.weight ?? "",
        color_options: Array.isArray(p.part.color_options) ? p.part.color_options.join(", ") : p.part.color_options || "",
        compatibility: Array.isArray(p.part.compatibility) ? p.part.compatibility.join(", ") : p.part.compatibility || "",
      });      
      if (manufacturersResult.data) {
        const manufacturersData = Array.isArray(manufacturersResult.data)
          ? manufacturersResult.data
          : (manufacturersResult.data as any).manufacturers || (manufacturersResult.data as any).data || [];
        setManufacturers(manufacturersData);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        toast.error(`${file.name} is not a valid image file`);
      }
      return isValid;
    });

    const filesToAdd = validFiles.slice(0, 10 - imageFiles.length);
    if (validFiles.length > filesToAdd.length) {
      toast.warning(`Only the first ${filesToAdd.length} images were added (max 10)`);
    }

    setImageFiles(prev => [...prev, ...filesToAdd]);

    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    // Check if it's a new file or existing image
    const totalPreviews = existingImages.length + imageFiles.length;
    if (index < existingImages.length) {
      // Remove existing image
      setExistingImages(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove new file
      const fileIndex = index - existingImages.length;
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);

    const colorOptions = form.color_options
      ? form.color_options.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];
    const compatibility = form.compatibility
      ? form.compatibility.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    // Create FormData
    const formData = new FormData();
    formData.append('name', form.name);
    if (form.description) formData.append('description', form.description);
    if (form.original_price) formData.append('original_price', form.original_price);
    if (form.selling_price) formData.append('selling_price', form.selling_price);
    if (form.quantity) formData.append('quantity', form.quantity);
    if (form.weight) formData.append('weight', form.weight);
    
    // Append new images
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });
    
    // Append existing images as URLs (if backend needs them)
    existingImages.forEach((url) => {
      formData.append('existing_images', url);
    });
    
    if (colorOptions.length > 0) {
      formData.append('color_options', colorOptions.join(','));
    }
    if (compatibility.length > 0) {
      formData.append('compatibility', compatibility.join(','));
    }

    const { error } = await partsApi.update(id, formData);
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="flex items-center cursor-pointer hover:underline text-primary" onClick={() => navigate(-1)}>
          <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />  
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground ml-2 hover:underline">Edit Part</h1>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <Label htmlFor="manufacturer_id">Manufacturer</Label>
                <Select value={form.manufacturer_id} onValueChange={(v) => setForm({ ...form, manufacturer_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select manufacturer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Create New Manufacturer</SelectItem>
                    {manufacturers.map((m) => (
                      <SelectItem value={m.id} key={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.manufacturer_id === "new" && (
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <Input placeholder="Manufacturer name" value={newManufacturerName} onChange={(e) => setNewManufacturerName(e.target.value)} />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="color_options">Color Options (comma-separated)</Label>
                <Input id="color_options" value={form.color_options} onChange={(e) => setForm({ ...form, color_options: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="compatibility">Compatibility (comma-separated)</Label>
                <Input id="compatibility" value={form.compatibility} onChange={(e) => setForm({ ...form, compatibility: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="images">Images</Label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Label
                      htmlFor="images"
                      className="flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Images</span>
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      {imageFiles.length > 0 && `${imageFiles.length} new image(s) selected`}
                    </span>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-md border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="w-full sm:w-auto sm:min-w-[120px] bg-gradient-primary mb-2" onClick={onSubmit as any} disabled={saving}>
                {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : (<>Save</>)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
