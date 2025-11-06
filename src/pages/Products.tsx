import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/DataTable";
import { productsApi, partsApi, merchandiseApi, brandsApi, categoriesApi, getImageUrl } from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProductRow {
  images: string[];
  id: string;
  name: string;
  type: "part" | "merch";
  price?: number;
  merch_price?: number;
  quantity: number;
  is_active: boolean | number;
  brand_name?: string;
  category_name?: string;
  image_url?: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isPartDialogOpen, setIsPartDialogOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creatingPart, setCreatingPart] = useState(false);
  const [partFormData, setPartFormData] = useState({
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
  const [newBrandDescription, setNewBrandDescription] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  useEffect(() => {
    loadProducts();
  }, [page, search, type]);

  useEffect(() => {
    if (isPartDialogOpen) {
      loadBrandsAndCategories();
    }
  }, [isPartDialogOpen]);

  const loadBrandsAndCategories = async () => {
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
  };

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await productsApi.getAll({ 
      page, 
      limit: 20, 
      search,
      ...(type && type !== "all" && { type })
    });

    if (error) {
      toast.error("Failed to load products");
      setLoading(false);
      return;
    }

    if (data) {
      const d: any = data;
      const parts: ProductRow[] = Array.isArray(d.parts)
        ? d.parts.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: "part",
            price: p.selling_price ? parseFloat(p.selling_price) : undefined,
            quantity: p.quantity ?? 0,
            is_active: p.is_active ?? 0,
            brand_name: p.brand_name,
            category_name: p.category_name,
            image_url: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : undefined,
          }))
        : [];
      const merch: ProductRow[] = Array.isArray(d.merchandise)
        ? d.merchandise.map((m: any) => ({
            id: m.id,
            name: m.name,
            type: "merch",
            merch_price: m.price ? parseFloat(m.price) : undefined,
            quantity: m.quantity ?? 0,
            is_active: m.is_active ?? 0,
            image_url: Array.isArray(m.images) && m.images.length > 0 ? m.images[0] : undefined,
          }))
        : [];

      const combined = type === "part" ? parts : type === "merch" ? merch : [...parts, ...merch];
      setProducts(combined);

      // choose pagination set based on type
      const pag = type === "merch" ? d.merchandise_pagination || null : d.pagination || null;
      setPagination(pag);
    }
    setLoading(false);
  };

  const handlePartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPart(true);

    try {
      let brandId = partFormData.brand_id;
      let categoryId = partFormData.category_id;

      // Create brand if "new" is selected
      if (brandId === "new") {
        if (!newBrandName.trim() || !newBrandDescription.trim()) {
          toast.error("Brand name and description are required");
          setCreatingPart(false);
          return;
        }
        const { data: brandData, error: brandError } = await brandsApi.create(new FormData({
          name: newBrandName,
          description: newBrandDescription,
        } as any));
        if (brandError || !brandData) {
          toast.error(brandError || "Failed to create brand");
          setCreatingPart(false);
          return;
        }
        // Extract ID from response - handle different response structures
        // The apiRequest wraps responses, so brandData is the direct response from backend
        let newBrandId = (brandData as any).id;
        if (!newBrandId && (brandData as any).brand) {
          newBrandId = (brandData as any).brand.id;
        }
        if (!newBrandId && (brandData as any).data) {
          newBrandId = (brandData as any).data.id;
        }
        
        if (!newBrandId) {
          console.error("Brand creation response structure:", JSON.stringify(brandData, null, 2));
          toast.error("Failed to get brand ID from response. Check console for details.");
          setCreatingPart(false);
          return;
        }
        brandId = newBrandId;
        // Update form state to use the new brand ID
        setPartFormData({ ...partFormData, brand_id: brandId });
        setNewBrandName("");
        setNewBrandDescription("");
        toast.success("Brand created successfully");
        await loadBrandsAndCategories();
      }

      // Create category if "new" is selected
      if (categoryId === "new") {
        if (!newCategoryName.trim() || !newCategoryDescription.trim()) {
          toast.error("Category name and description are required");
          setCreatingPart(false);
          return;
        }
        const { data: categoryData, error: categoryError } = await categoriesApi.create({
          name: newCategoryName,
          description: newCategoryDescription,
        });
        if (categoryError || !categoryData) {
          toast.error(categoryError || "Failed to create category");
          setCreatingPart(false);
          return;
        }
        // Extract ID from response - handle different response structures
        // The apiRequest wraps responses, so categoryData is the direct response from backend
        let newCategoryId = (categoryData as any).id;
        if (!newCategoryId && (categoryData as any).category) {
          newCategoryId = (categoryData as any).category.id;
        }
        if (!newCategoryId && (categoryData as any).data) {
          newCategoryId = (categoryData as any).data.id;
        }
        
        if (!newCategoryId) {
          console.error("Category creation response structure:", JSON.stringify(categoryData, null, 2));
          toast.error("Failed to get category ID from response. Check console for details.");
          setCreatingPart(false);
          return;
        }
        categoryId = newCategoryId;
        // Update form state to use the new category ID
        setPartFormData({ ...partFormData, category_id: categoryId });
        setNewCategoryName("");
        setNewCategoryDescription("");
        toast.success("Category created successfully");
        await loadBrandsAndCategories();
      }

      // Parse arrays from comma-separated strings
      const images = partFormData.images
        ? partFormData.images.split(",").map((img) => img.trim()).filter(Boolean)
        : [];
      const colorOptions = partFormData.color_options
        ? partFormData.color_options.split(",").map((color) => color.trim()).filter(Boolean)
        : [];
      const compatibility = partFormData.compatibility
        ? partFormData.compatibility.split(",").map((item) => item.trim()).filter(Boolean)
        : [];

      // Validate that we have valid UUIDs
      if (!brandId || brandId === "new") {
        toast.error("Invalid brand ID. Please select a brand.");
        setCreatingPart(false);
        return;
      }
      if (!categoryId || categoryId === "new") {
        toast.error("Invalid category ID. Please select a category.");
        setCreatingPart(false);
        return;
      }

      // Create the part
      const partData = {
        brand_id: brandId,
        category_id: categoryId,
        name: partFormData.name,
        description: partFormData.description || undefined,
        original_price: parseFloat(partFormData.original_price),
        selling_price: parseFloat(partFormData.selling_price),
        quantity: parseInt(partFormData.quantity),
        weight: partFormData.weight ? parseFloat(partFormData.weight) : undefined,
        images: images.length > 0 ? images : undefined,
        color_options: colorOptions.length > 0 ? colorOptions : undefined,
        compatibility: compatibility.length > 0 ? compatibility : undefined,
      };

      const { error } = await partsApi.create(new FormData(partData as any));

      if (error) {
        toast.error(error || "Failed to create part");
        setCreatingPart(false);
        return;
      }

      toast.success("Part created successfully");
      setIsPartDialogOpen(false);
      setPartFormData({
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
      setNewBrandName("");
      setNewBrandDescription("");
      setNewCategoryName("");
      setNewCategoryDescription("");
      loadProducts();
    } catch (error) {
      toast.error("An error occurred while creating the part");
      console.error(error);
    } finally {
      setCreatingPart(false);
    }
  };

  const productColumns = [
    {
      key: "name",
      label: "Item",
      render: (_: any, item: ProductRow) => {
        console.log("item", item);
        const imgSrc = getImageUrl(item.image_url);
        console.log("imgSrc", imgSrc);
        return (
          <div className="flex items-center gap-3">
            <img src={imgSrc} alt={item.name} className="h-20 w-20 rounded object-cover border border-border" />
            <button
              onClick={() => navigate(item.type === "part" ? `/products/parts/${item.id}` : `/products/merchandise/${item.id}`)}
              className="text-primary hover:underline text-left"
            >
              {item.name}
            </button>
          </div>
        );
      },
    },
    {
      key: "type",
      label: "Type",
      render: (value: string) => (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          value === "part" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent-foreground"
        }`}>
          {value}
        </span>
      ),
    },
    { key: "brand_name", label: "Brand", render: (v: string, item: ProductRow) => item.type === "part" ? (v || "-") : "-" },
    { key: "category_name", label: "Category", render: (v: string, item: ProductRow) => item.type === "part" ? (v || "-") : "-" },
    {
      key: "price",
      label: "Price",
      render: (_: any, item: ProductRow) => {
        const val = item.type === "part" ? item.price : item.merch_price;
        return val !== undefined ? `$${Number(val).toFixed(2)}` : "-";
      },
    },
    { key: "quantity", label: "Stock" },
    {
      key: "is_active",
      label: "Status",
      render: (value: boolean) => (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          value ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
        }`}>
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, item: ProductRow) => {
        const onDelete = async () => {
          if (!confirm(`Delete ${item.type} “${item.name}”?`)) return;
          const { error } = item.type === "part" ? await partsApi.delete(item.id) : await merchandiseApi.delete(item.id);
          if (error) {
            toast.error(error || "Failed to delete");
          } else {
            toast.success("Deleted successfully");
            loadProducts();
          }
        };
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(item.type === "part" ? `/products/parts/${item.id}` : `/products/merchandise/${item.id}`)}>Edit</Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>Delete</Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage parts and merchandise</p>
        </div>
        <Dialog open={isPartDialogOpen} onOpenChange={setIsPartDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary" onClick={() => navigate('/products/parts/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Part
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Part</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePartSubmit} className="space-y-4">
              <div>
                <Label htmlFor="brand_id">Brand *</Label>
                <Select
                  value={partFormData.brand_id}
                  onValueChange={(value) =>
                    setPartFormData({ ...partFormData, brand_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Create New Brand</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {partFormData.brand_id === "new" && (
                  <>
                  <Input
                    placeholder="Enter brand name"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    className="mt-2"
                    required
                  />
                <Input
                  placeholder="Create brnad description"
                  value={newBrandDescription}
                  onChange={(e) => setNewBrandDescription(e.target.value)}
                  className="mt-2"
                  required
                  />
                  </>
  
                )}
              </div>

              <div>
                <Label htmlFor="category_id">Category *</Label>
                <Select
                  value={partFormData.category_id}
                  onValueChange={(value) =>
                    setPartFormData({ ...partFormData, category_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Create New Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {partFormData.category_id === "new" && (
                <>
                <Input
                    placeholder="Enter category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="mt-2"
                    required
                  />
                  <Input
                    placeholder="Enter category description"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    className="mt-2"
                    required
                  />
                  </>
                )}
              </div>

              <div>
                <Label htmlFor="name">Part Name *</Label>
                <Input
                  id="name"
                  value={partFormData.name}
                  onChange={(e) =>
                    setPartFormData({ ...partFormData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={partFormData.description}
                  onChange={(e) =>
                    setPartFormData({ ...partFormData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="original_price">Original Price *</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={partFormData.original_price}
                    onChange={(e) =>
                      setPartFormData({ ...partFormData, original_price: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="selling_price">Selling Price *</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={partFormData.selling_price}
                    onChange={(e) =>
                      setPartFormData({ ...partFormData, selling_price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={partFormData.quantity}
                    onChange={(e) =>
                      setPartFormData({ ...partFormData, quantity: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (optional)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={partFormData.weight}
                    onChange={(e) =>
                      setPartFormData({ ...partFormData, weight: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="images">Images (comma-separated URLs)</Label>
                <Input
                  id="images"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  value={partFormData.images}
                  onChange={(e) =>
                    setPartFormData({ ...partFormData, images: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="color_options">Color Options (comma-separated)</Label>
                <Input
                  id="color_options"
                  placeholder="Red, Blue, Green"
                  value={partFormData.color_options}
                  onChange={(e) =>
                    setPartFormData({ ...partFormData, color_options: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="compatibility">Compatibility (comma-separated models)</Label>
                <Input
                  id="compatibility"
                  placeholder="Model A, Model B, Model C"
                  value={partFormData.compatibility}
                  onChange={(e) =>
                    setPartFormData({ ...partFormData, compatibility: e.target.value })
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary"
                disabled={creatingPart}
              >
                {creatingPart ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Part"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="part">Parts</SelectItem>
            <SelectItem value="merch">Merchandise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <DataTable
          columns={productColumns}
          data={products}
          pagination={pagination}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
