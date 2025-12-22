"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { ServiceType } from "@/types";

const ServicesPage = () => {
  const { t } = useLanguage();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    serviceFee: "",
    duration: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get("/service-types");
      
      // Handle both paginated and non-paginated responses
      const servicesData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
      alert("Failed to fetch services");
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

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold">{t("services")}</h1>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("addServiceType")}
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchServices")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
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
                    {service.serviceFee} Ks
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

      {filteredServices.length === 0 && (
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
