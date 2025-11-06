import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { partsApi, brandsApi, categoriesApi, modelsApi } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, ArrowLeft, ArrowLeftIcon, X, Upload } from "lucide-react";

interface Brand { id: string; name: string }
interface Category { id: string; name: string }
interface Model { id: string; name: string; make_name?: string }

export default function CreatePart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);


  const [form, setForm] = useState({
    brand_id: "",
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

  const [newBrandName, setNewBrandName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        toast.error(`${file.name} is not a valid image file`);
      }
      return isValid;
    });

    // Limit to 10 images
    const filesToAdd = validFiles.slice(0, 10 - imageFiles.length);
    if (validFiles.length > filesToAdd.length) {
      toast.warning(`Only the first ${filesToAdd.length} images were added (max 10)`);
    }

    setImageFiles(prev => [...prev, ...filesToAdd]);

    // Create previews
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Fetch models when brand changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!form.brand_id || form.brand_id === "new") {
        setModels([]);
        setSelectedModelIds([]);
        return;
      }

      const selectedBrand = brands.find(b => b.id === form.brand_id);
      if (!selectedBrand || !selectedBrand.name) {
        setModels([]);
        setSelectedModelIds([]);
        return;
      }

      setLoadingModels(true);
      const { data, error } = await modelsApi.getByMakeName(selectedBrand.name);
      
      if (error) {
        toast.error(`Failed to load models: ${error}`);
        setModels([]);
      } else if (data) {
        const modelsData = Array.isArray(data) 
          ? data 
          : (data as any).models || (data as any).data || [];
        setModels(modelsData);
      } else {
        setModels([]);
      }
      setLoadingModels(false);
    };

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      fetchModels();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [form.brand_id, brands]);

  const handleModelToggle = (modelId: string) => {
    setSelectedModelIds(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const ensureBrandAndCategory = async () => {
    let brandId = form.brand_id;
    let categoryId = form.category_id;

    if (brandId === "new") {
      if (!newBrandName.trim()) {
        toast.error("Brand name is required");
        return { ok: false };
      }
      // Create FormData for brand
      const brandFormData = new FormData();
      brandFormData.append('name', newBrandName);
      
      const { data: brandData, error } = await brandsApi.create(brandFormData);
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

    const colorOptions = form.color_options ? form.color_options.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const compatibility = form.compatibility ? form.compatibility.split(",").map((s) => s.trim()).filter(Boolean) : [];

    // Create FormData
    const formData = new FormData();
    formData.append('brand_id', ensured.brandId);
    formData.append('category_id', ensured.categoryId);
    formData.append('name', form.name);
    if (form.description) formData.append('description', form.description);
    if (form.original_price) formData.append('original_price', form.original_price);
    if (form.selling_price) formData.append('selling_price', form.selling_price);
    if (form.quantity) formData.append('quantity', form.quantity);
    if (form.weight) formData.append('weight', form.weight);
    
    // Append images
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });
    
    // Append color options and compatibility as JSON strings or comma-separated
    if (colorOptions.length > 0) {
      formData.append('color_options', colorOptions.join(','));
    }
    if (compatibility.length > 0) {
      formData.append('compatibility', compatibility.join(','));
    }
    
    // Append selected models
    selectedModelIds.forEach((modelId) => {
      formData.append('model_ids', modelId);
    });

    const { error } = await partsApi.create(formData);
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
                <Combobox
                  options={brands.map((b) => ({ value: b.id, label: b.name }))}
                  value={form.brand_id}
                  onValueChange={(v) => setForm({ ...form, brand_id: v })}
                  placeholder="Select brand"
                  searchPlaceholder="Search brands..."
                  emptyText="No brand found."
                  allowCustom={true}
                  onCreateNew={() => setForm({ ...form, brand_id: "new" })}
                />
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
            <div className="grid grid-cols-1 gap-4">
              {loadingModels && (
                <p className="text-sm text-muted-foreground">Loading models...</p>
              )}
              {models.length > 0 && (
                <div>
                  <Label>Select Models</Label>
                  <div className="mt-2 border rounded-md p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {models.map((model) => (
                        <div key={model.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`model-${model.id}`}
                            checked={selectedModelIds.includes(model.id)}
                            onCheckedChange={() => handleModelToggle(model.id)}
                          />
                          <Label
                            htmlFor={`model-${model.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {model.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedModelIds.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {selectedModelIds.length} model(s) selected
                    </p>
                  )}
                </div>
              )}
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
                    {imageFiles.length > 0 && `${imageFiles.length} image(s) selected`}
                  </span>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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


