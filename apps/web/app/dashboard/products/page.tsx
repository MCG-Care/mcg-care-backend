"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Search,
  Package,
  Image as ImageIcon,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { Product } from "@/types";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";

const ProductsPage = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"releaseDate-asc" | "releaseDate-desc" | "capacity-asc" | "capacity-desc" | "price-asc" | "price-desc" | null>(null);
  const [filterByBrand, setFilterByBrand] = useState<string>("all");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isInitialLoadRef = useRef(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    productModel: "",
    brand: "",
    type: "split" as Product["type"],
    price: "",
    description: "",
    capacity: "",
    energyRating: "",
    coolingPower: "",
    refrigerant: "",
    warranty: "",
    tagline: "",
    voltageAverage: "",
    voltageCount: "",
    releaseDate: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search - only trigger fetch after user stops typing/deleting (500ms for slow typers)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, debouncedSearch, filterByBrand]);

  // Restore focus to search input after refresh completes (skip initial load)
  useEffect(() => {
    if (!loading && searchInputRef.current) {
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      } else {
        searchInputRef.current.focus();
      }
    }
  }, [loading]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    if (isSortDropdownOpen || isFilterDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortDropdownOpen, isFilterDropdownOpen]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch with high limit for client-side brand filtering (no backend changes)
      const params: Record<string, any> = {
        page: 1,
        limit: 2000, // Fetch enough to filter by brand on client
      };
      
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      
      const response = await api.get("/products", { params });
      let productsData: Product[] = response.data?.data || [];
      
      // Extract unique brands for dropdown (from unfiltered data)
      const brands = [...new Set(productsData.map((p: Product) => p.brand).filter(Boolean))].sort();
      setAvailableBrands(brands);
      
      // Client-side filter by brand
      if (filterByBrand !== "all" && filterByBrand) {
        productsData = productsData.filter(
          (p: Product) => p.brand?.toLowerCase() === filterByBrand.toLowerCase()
        );
      }
      
      // Client-side pagination
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = productsData.slice(start, end);
      
      setProducts(paginatedData);
      setTotalProducts(productsData.length);
      setTotalPages(Math.ceil(productsData.length / pageSize) || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to fetch products");
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setIsEditing(false);
    setIsViewing(false);
    setSelectedProduct(null);
    resetForm();
  };

  const handleView = async (product: Product) => {
    try {
      // Fetch full product details
      const response = await api.get(`/products/${product.id}`);
      setSelectedProduct(response.data);
      setIsViewing(true);
      setIsEditing(false);
      setIsCreating(false);
    } catch (error) {
      console.error("Error fetching product details:", error);
      setSelectedProduct(product);
      setIsViewing(true);
      setIsEditing(false);
      setIsCreating(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(true);
    setIsViewing(false);
    setIsCreating(false);
    setFormData({
      name: product.name || "",
      productModel: product.productModel || "",
      brand: product.brand || "",
      type: product.type || "split",
      price: product.price || "",
      description: product.description || "",
      capacity: product.capacity?.toString() || "",
      energyRating: product.energyRating?.toString() || "",
      coolingPower: product.coolingPower?.toString() || "",
      refrigerant: product.refrigerant || "",
      warranty: product.warranty?.toString() || "",
      tagline: product.tagline || "",
      voltageAverage: product.voltageAverage?.toString() || "",
      voltageCount: product.voltageCount?.toString() || "",
      releaseDate: product.releaseDate || "",
    });
    setImages([]);
    setImagePreviews([]);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      productModel: "",
      brand: "",
      type: "split",
      price: "",
      description: "",
      capacity: "",
      energyRating: "",
      coolingPower: "",
      refrigerant: "",
      warranty: "",
      tagline: "",
      voltageAverage: "",
      voltageCount: "",
      releaseDate: "",
    });
    setImages([]);
    setImagePreviews([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      
      // Create previews
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Add images
      images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      if (isEditing && selectedProduct) {
        // Update product
        await api.patch(`/products/${selectedProduct.id}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Create product
        await api.post("/products", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setCurrentPage(1); // Reset to first page after create/update
      await fetchProducts();
      handleCancel();
    } catch (error: any) {
      console.error("Error saving product:", error);
      alert(error.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("areYouSureDeleteProduct"))) return;

    try {
      await api.delete(`/products/${id}`);
      // If we're on a page that might become empty, go back a page
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      await fetchProducts();
      if (selectedProduct?.id === id) {
        handleCancel();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const handleDeleteImage = async (productId: string, imageId: string) => {
    if (!confirm(t("areYouSureDeleteImage"))) return;

    try {
      await api.delete(`/products/${productId}/images/${imageId}`);
      await fetchProducts();
      // Refresh selected product if viewing/editing
      if (selectedProduct && selectedProduct.id === productId) {
        const response = await api.get(`/products/${productId}`);
        setSelectedProduct(response.data);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image");
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setIsViewing(false);
    setSelectedProduct(null);
    resetForm();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Search and filter are now handled server-side, so we just use products directly
  const filteredProducts = products;

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Default sorting: newest first (by createdAt)
    if (!sortBy) {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Descending order (newest first)
    }
    
    switch (sortBy) {
      case "price-asc":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-desc":
        return parseFloat(b.price) - parseFloat(a.price);
      case "capacity-asc":
        const capacityA = a.capacity || 0;
        const capacityB = b.capacity || 0;
        return capacityA - capacityB;
      case "capacity-desc":
        const capacityADesc = a.capacity || 0;
        const capacityBDesc = b.capacity || 0;
        return capacityBDesc - capacityADesc;
      case "releaseDate-asc":
        const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
        const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
        return dateA - dateB;
      case "releaseDate-desc":
        const dateADesc = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
        const dateBDesc = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
        return dateBDesc - dateADesc;
      default:
        return 0;
    }
  });

  // Only show full-page loader on initial load (no data yet). Keep search bar visible during search/filter to prevent focus loss.
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-m font-bold">{t("manageProducts")}</h1>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("addProduct")}
        </Button>
      </div>

      {/* Search Bar, Sort and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder={t("searchProducts")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <div ref={filterDropdownRef} className="relative">
                <DropdownMenuTrigger
                  className={cn(buttonVariants({ variant: "outline", size: "default" }), "gap-2")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFilterDropdownOpen(!isFilterDropdownOpen);
                  }}
                >
                  <Filter className="h-4 w-4" />
                  {filterByBrand === "all"
                    ? t("filterByBrand")
                    : filterByBrand}
                </DropdownMenuTrigger>
                {isFilterDropdownOpen && (
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setFilterByBrand("all");
                      setIsFilterDropdownOpen(false);
                      setCurrentPage(1);
                    }}>
                      {t("allBrands")}
                    </DropdownMenuItem>
                    {availableBrands.map((brand) => (
                      <DropdownMenuItem
                        key={brand}
                        onClick={() => {
                          setFilterByBrand(brand);
                          setIsFilterDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                      >
                        {brand}
                      </DropdownMenuItem>
                    ))}
                    {filterByBrand !== "all" && (
                      <DropdownMenuItem onClick={() => {
                        setFilterByBrand("all");
                        setIsFilterDropdownOpen(false);
                      }}>
                        {t("clearFilter")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                )}
              </div>
            </DropdownMenu>
            <DropdownMenu>
              <div ref={sortDropdownRef} className="relative">
                <DropdownMenuTrigger
                  className={cn(buttonVariants({ variant: "outline", size: "default" }), "gap-2")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSortDropdownOpen(!isSortDropdownOpen);
                  }}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {sortBy === "price-asc"
                    ? t("sortByPriceAsc")
                    : sortBy === "price-desc"
                    ? t("sortByPriceDesc")
                    : sortBy === "capacity-asc"
                    ? t("sortByCapacityAsc")
                    : sortBy === "capacity-desc"
                    ? t("sortByCapacityDesc")
                    : sortBy === "releaseDate-asc"
                    ? t("sortByDateAsc")
                    : sortBy === "releaseDate-desc"
                    ? t("sortByDateDesc")
                    : t("sortBy")}
                </DropdownMenuTrigger>
                {isSortDropdownOpen && (
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSortBy("price-asc");
                      setIsSortDropdownOpen(false);
                    }}>
                      <div className="flex items-center gap-2">
                        <ArrowUp className="h-3 w-3" />
                        {t("sortByPriceAsc")}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSortBy("price-desc");
                      setIsSortDropdownOpen(false);
                    }}>
                      <div className="flex items-center gap-2">
                        <ArrowDown className="h-3 w-3" />
                        {t("sortByPriceDesc")}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSortBy("capacity-asc");
                      setIsSortDropdownOpen(false);
                    }}>
                      <div className="flex items-center gap-2">
                        <ArrowUp className="h-3 w-3" />
                        {t("sortByCapacityAsc")}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSortBy("capacity-desc");
                      setIsSortDropdownOpen(false);
                    }}>
                      <div className="flex items-center gap-2">
                        <ArrowDown className="h-3 w-3" />
                        {t("sortByCapacityDesc")}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSortBy("releaseDate-asc");
                      setIsSortDropdownOpen(false);
                    }}>
                      <div className="flex items-center gap-2">
                        <ArrowUp className="h-3 w-3" />
                        {t("sortByDateAsc")}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSortBy("releaseDate-desc");
                      setIsSortDropdownOpen(false);
                    }}>
                      <div className="flex items-center gap-2">
                        <ArrowDown className="h-3 w-3" />
                        {t("sortByDateDesc")}
                      </div>
                    </DropdownMenuItem>
                    {sortBy && (
                      <DropdownMenuItem onClick={() => {
                        setSortBy(null);
                        setIsSortDropdownOpen(false);
                      }}>
                        {t("clearSort")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                )}
              </div>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Info */}
      {!loading && totalProducts > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalProducts)} of {totalProducts} products
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Items per page:</Label>
            <select
              className="px-2 py-1 border rounded-md bg-background"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map((product) => (
          <Card
            key={product.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleView(product)}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 gap-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <CardTitle className="text-lg truncate w-full">{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground truncate w-full">
                    {product.brand} • {product.productModel}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {product.productImages && product.productImages.length > 0 && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={product.productImages[0].url}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("type")}</span>
                  <span className="text-sm font-medium capitalize">{t(product.type)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("price")}</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(product.price)} Ks
                  </span>
                </div>
                {product.capacity && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t("capacity")}</span>
                    <span className="text-sm font-medium">{product.capacity} HP</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(product);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  {t("viewDetails")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(product);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(product.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedProducts.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {searchQuery || filterByBrand !== "all"
                ? t("noProductsFound")
                : t("noProductsAvailable")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="min-w-[40px]"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </div>
      )}

      {/* View/Edit/Create Modal */}
      {(isViewing || isEditing || isCreating) && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleCancel}
        >
          <Card
            className="w-full max-w-4xl bg-background my-8 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b flex-shrink-0">
              <CardTitle>
                {isCreating
                  ? t("createProduct")
                  : isEditing
                  ? t("editProduct")
                  : selectedProduct?.name || ""}
              </CardTitle>
              <div className="flex gap-2">
                {isViewing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedProduct) handleEdit(selectedProduct);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t("edit")}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 overflow-y-auto flex-1 pb-4">
              {isViewing && selectedProduct ? (
                // View Mode
                <div className="space-y-6">
                  {/* Images */}
                  {selectedProduct.productImages && selectedProduct.productImages.length > 0 && (
                    <div>
                      <Label className="text-base font-semibold mb-2 block">
                        {t("productImages")}
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedProduct.productImages.map((img) => (
                          <div key={img.id} className="relative group">
                            <Image
                              src={img.url}
                              alt={selectedProduct?.name || "Product"}
                              width={200}
                              height={200}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteImage(selectedProduct.id, img.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">{t("productName")}</Label>
                      <p className="font-medium">{selectedProduct.name || ""}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">{t("productModel")}</Label>
                      <p className="font-medium">{selectedProduct.productModel}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">{t("brand")}</Label>
                      <p className="font-medium">{selectedProduct.brand}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">{t("type")}</Label>
                      <p className="font-medium capitalize">{t(selectedProduct.type)}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">{t("price")}</Label>
                      <p className="font-medium text-primary">{formatCurrency(selectedProduct.price)} Ks</p>
                    </div>
                    {selectedProduct.capacity && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t("capacity")}</Label>
                        <p className="font-medium">{selectedProduct.capacity} HP</p>
                      </div>
                    )}
                    {selectedProduct.energyRating && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t("energyRating")}</Label>
                        <p className="font-medium">{selectedProduct.energyRating}</p>
                      </div>
                    )}
                    {selectedProduct.coolingPower && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t("coolingPower")}</Label>
                        <p className="font-medium">{selectedProduct.coolingPower} BTU</p>
                      </div>
                    )}
                    {selectedProduct.refrigerant && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t("refrigerant")}</Label>
                        <p className="font-medium">{selectedProduct.refrigerant}</p>
                      </div>
                    )}
                    {selectedProduct.warranty && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t("warranty")}</Label>
                        <p className="font-medium">{selectedProduct.warranty} {t("years") || "years"}</p>
                      </div>
                    )}
                    {selectedProduct.tagline && (
                      <div className="md:col-span-2">
                        <Label className="text-sm text-muted-foreground">{t("tagline")}</Label>
                        <p className="font-medium">{selectedProduct.tagline}</p>
                      </div>
                    )}
                    {selectedProduct.voltageAverage && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t("voltageAverage")}</Label>
                        <p className="font-medium">{selectedProduct.voltageAverage} V</p>
                      </div>
                    )}
                    {selectedProduct.voltageCount && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t("voltageCount")}</Label>
                        <p className="font-medium">{selectedProduct.voltageCount}</p>
                      </div>
                    )}
                    {selectedProduct.releaseDate && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t("releaseDate")}</Label>
                        <p className="font-medium">{selectedProduct.releaseDate}</p>
                      </div>
                    )}
                    {selectedProduct.description && (
                      <div className="md:col-span-2">
                        <Label className="text-sm text-muted-foreground">{t("description")}</Label>
                        <p className="font-medium">{selectedProduct.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Edit/Create Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t("productName")} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g., Daikin Split Air Conditioner"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productModel">{t("productModel")} *</Label>
                      <Input
                        id="productModel"
                        value={formData.productModel}
                        onChange={(e) =>
                          setFormData({ ...formData, productModel: e.target.value })
                        }
                        placeholder="e.g., DKIN-SP-2024-001"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand">{t("brand")} *</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData({ ...formData, brand: e.target.value })
                        }
                        placeholder="e.g., Daikin"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">{t("type")} *</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value as Product["type"] })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      >
                        <option value="split">{t("split")}</option>
                        <option value="window">{t("window")}</option>
                        <option value="cassette">{t("cassette")}</option>
                        <option value="portable">{t("portable")}</option>
                        <option value="central">{t("central")}</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="price">{t("price")} *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        placeholder="e.g., 1299.99"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="capacity">{t("capacity")}</Label>
                      <Input
                        id="capacity"
                        type="number"
                        step="0.1"
                        value={formData.capacity}
                        onChange={(e) =>
                          setFormData({ ...formData, capacity: e.target.value })
                        }
                        placeholder="e.g., 2.5"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="energyRating">{t("energyRating")}</Label>
                      <Input
                        id="energyRating"
                        type="number"
                        value={formData.energyRating}
                        onChange={(e) =>
                          setFormData({ ...formData, energyRating: e.target.value })
                        }
                        placeholder="e.g., 5"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coolingPower">{t("coolingPower")}</Label>
                      <Input
                        id="coolingPower"
                        type="number"
                        value={formData.coolingPower}
                        onChange={(e) =>
                          setFormData({ ...formData, coolingPower: e.target.value })
                        }
                        placeholder="e.g., 9000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="refrigerant">{t("refrigerant")}</Label>
                      <Input
                        id="refrigerant"
                        value={formData.refrigerant}
                        onChange={(e) =>
                          setFormData({ ...formData, refrigerant: e.target.value })
                        }
                        placeholder="e.g., R32"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="warranty">{t("warranty")}</Label>
                      <Input
                        id="warranty"
                        type="number"
                        value={formData.warranty}
                        onChange={(e) =>
                          setFormData({ ...formData, warranty: e.target.value })
                        }
                        placeholder="e.g., 3"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tagline">{t("tagline")}</Label>
                      <Input
                        id="tagline"
                        value={formData.tagline}
                        onChange={(e) =>
                          setFormData({ ...formData, tagline: e.target.value })
                        }
                        placeholder="e.g., Cool Comfort, Energy Efficient"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="voltageAverage">{t("voltageAverage")}</Label>
                      <Input
                        id="voltageAverage"
                        type="number"
                        value={formData.voltageAverage}
                        onChange={(e) =>
                          setFormData({ ...formData, voltageAverage: e.target.value })
                        }
                        placeholder="e.g., 220"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="voltageCount">{t("voltageCount")}</Label>
                      <Input
                        id="voltageCount"
                        type="number"
                        value={formData.voltageCount}
                        onChange={(e) =>
                          setFormData({ ...formData, voltageCount: e.target.value })
                        }
                        placeholder="e.g., 1"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="releaseDate">{t("releaseDate")}</Label>
                      <Input
                        id="releaseDate"
                        type="date"
                        value={formData.releaseDate}
                        onChange={(e) =>
                          setFormData({ ...formData, releaseDate: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">{t("description")}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder={t("description") + "..."}
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <Label>{t("productImages")}</Label>
                    <div className="mt-2 space-y-4">
                      {/* Existing Images (only in edit mode) */}
                      {isEditing && selectedProduct?.productImages && selectedProduct.productImages.length > 0 && (
                        <div>
                          <Label className="text-sm text-muted-foreground mb-2 block">
                            Existing Images
                          </Label>
                          <div className="grid grid-cols-3 gap-4">
                            {selectedProduct.productImages.map((img) => (
                              <div key={img.id} className="relative group">
                                <Image
                                  src={img.url}
                                  alt={selectedProduct?.name || "Product"}
                                  width={150}
                                  height={150}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleDeleteImage(selectedProduct.id, img.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New Image Upload */}
                      <div>
                        <Label htmlFor="images" className="cursor-pointer">
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {images.length > 0
                                ? `${images.length} ${t("imagesSelected")}`
                                : t("selectImages")}
                            </p>
                          </div>
                        </Label>
                        <Input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>

                      {/* Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <Image
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                width={150}
                                height={150}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  const newImages = images.filter((_, i) => i !== index);
                                  const newPreviews = imagePreviews.filter((_, i) => i !== index);
                                  setImages(newImages);
                                  setImagePreviews(newPreviews);
                                }}
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
              )}
            </CardContent>
            {/* Sticky Action Buttons - Only show for edit/create mode */}
            {(isEditing || isCreating) && (
              <div className="flex gap-2 p-4 border-t bg-background sticky bottom-0 flex-shrink-0">
                <Button
                  onClick={handleSave}
                  disabled={
                    saving ||
                    !formData.name ||
                    !formData.productModel ||
                    !formData.brand ||
                    !formData.price
                  }
                  className="flex-1 gap-2"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isEditing ? t("update") : t("create")}
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  {t("cancel")}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;

