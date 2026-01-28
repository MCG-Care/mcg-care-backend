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
  Wrench,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { ServiceType } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ServicesPage = () => {
  const { t } = useLanguage();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"fees-asc" | "fees-desc" | "duration-asc" | "duration-desc" | null>(null);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    serviceFee: "",
    duration: "",
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalServices, setTotalServices] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchServices();
  }, [currentPage, pageSize, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    };

    if (isSortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params: Record<string, any> = {
        page: currentPage,
        limit: pageSize,
      };
      
      // Add search if provided
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await api.get("/service-types", { params });
      
      // Handle paginated response
      const servicesData = response.data?.data || [];
      const pagination = response.data?.pagination || {};
      
      setServices(servicesData);
      setTotalServices(pagination.total || 0);
      setTotalPages(pagination.totalPages || 0);
    } catch (error) {
      console.error("Error fetching services:", error);
      alert("Failed to fetch services");
      setServices([]);
      setTotalServices(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      name: "",
      description: "",
      serviceFee: "",
      duration: "",
    });
  };

  const handleEdit = (service: ServiceType) => {
    setSelectedService(service);
    setIsEditing(true);
    setFormData({
      name: service.name,
      description: service.description,
      serviceFee: service.serviceFee,
      duration: service.duration.toString(),
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        serviceFee: parseFloat(formData.serviceFee),
        duration: parseInt(formData.duration),
      };

      if (isEditing && selectedService) {
        await api.patch(`/service-types/${selectedService.id}`, payload);
      } else {
        await api.post("/service-types", payload);
      }

      setCurrentPage(1); // Reset to first page after create/update
      await fetchServices();
      handleCancel();
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save service");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service type?")) return;

    try {
      await api.delete(`/service-types/${id}`);
      // If we're on a page that might become empty, go back a page
      if (services.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      await fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service");
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedService(null);
    setFormData({
      name: "",
      description: "",
      serviceFee: "",
      duration: "",
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Search is now handled server-side, so we just use services directly
  const filteredServices = services;

  const sortedServices = [...filteredServices].sort((a, b) => {
    if (!sortBy) return 0;
    
    switch (sortBy) {
      case "fees-asc":
        return parseFloat(a.serviceFee) - parseFloat(b.serviceFee);
      case "fees-desc":
        return parseFloat(b.serviceFee) - parseFloat(a.serviceFee);
      case "duration-asc":
        return a.duration - b.duration;
      case "duration-desc":
        return b.duration - a.duration;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-m font-bold">{t("manageServices")}</h1>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("addServiceType")}
        </Button>
      </div>

      {/* Search Bar and Sort */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchServices")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-10"
              />
            </div>
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
                {sortBy === "fees-asc"
                  ? t("sortByFeesAsc")
                  : sortBy === "fees-desc"
                  ? t("sortByFeesDesc")
                  : sortBy === "duration-asc"
                  ? t("sortByDurationAsc")
                  : sortBy === "duration-desc"
                  ? t("sortByDurationDesc")
                  : t("sortBy")}
              </DropdownMenuTrigger>
              {isSortDropdownOpen && (
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setSortBy("fees-asc");
                    setIsSortDropdownOpen(false);
                  }}>
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-3 w-3" />
                      {t("sortByFeesAsc")}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSortBy("fees-desc");
                    setIsSortDropdownOpen(false);
                  }}>
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-3 w-3" />
                      {t("sortByFeesDesc")}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSortBy("duration-asc");
                    setIsSortDropdownOpen(false);
                  }}>
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-3 w-3" />
                      {t("sortByDurationAsc")}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSortBy("duration-desc");
                    setIsSortDropdownOpen(false);
                  }}>
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-3 w-3" />
                      {t("sortByDurationDesc")}
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
      {!loading && totalServices > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalServices)} of {totalServices} services
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

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedServices.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(service)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(service.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {service.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">{t("serviceFee")}</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(service.serviceFee)} Ks
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("duration")}</p>
                  <p className="text-lg font-semibold">{service.duration} min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedServices.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {searchQuery
                ? t("noServicesFound")
                : t("noServicesAvailable")}
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

      {/* Create/Edit Modal */}
      {(isCreating || isEditing) && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCancel}
        >
          <Card
            className="w-full max-w-2xl bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>
                {isEditing ? t("editServiceType") : t("createServiceType")}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="name">{t("serviceName")} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Standard Cleaning"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">{t("description")} *</Label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceFee">{t("serviceFee")} *</Label>
                  <Input
                    id="serviceFee"
                    type="number"
                    value={formData.serviceFee}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceFee: e.target.value })
                    }
                    placeholder="50.00"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">{t("duration")} *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="60"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={
                    !formData.name ||
                    !formData.description ||
                    !formData.serviceFee ||
                    !formData.duration
                  }
                  className="flex-1 gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isEditing ? t("update") : t("create")}
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  {t("cancel")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;

