"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Wrench, Plus, Edit, Trash2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE_URL = "https://mcg-care-backend.onrender.com";

interface Service {
  id: number;
  name: string;
  description: string;
  serviceFee: string;
  duration: number;
}

export default function ServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
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
      setError(null);

      // Service types are public, no auth needed
      const response = await fetch(`${API_BASE_URL}/service-types?page=1&limit=100`);

      if (response.ok) {
        const data = await response.json();
        console.log("Services Response:", data);
        setServices(data.data || []);
      } else {
        const errorText = await response.text();
        console.error("Services API Error:", response.status, errorText);
        setError(`Failed to load services: ${response.status}`);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to load services. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      serviceFee: "",
      duration: "",
    });
    setShowModal(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      serviceFee: service.serviceFee,
      duration: service.duration.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      alert("Please login to manage services");
      return;
    }

    try {
      const url = editingService
        ? `${API_BASE_URL}/service-types/${editingService.id}`
        : `${API_BASE_URL}/service-types`;

      const method = editingService ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          serviceFee: parseFloat(formData.serviceFee),
          duration: parseInt(formData.duration),
        }),
      });

      if (response.ok) {
        alert(editingService ? "Service updated successfully!" : "Service created successfully!");
        setShowModal(false);
        fetchServices();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to save service");
      }
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save service. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      alert("Please login to delete services");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/service-types/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        alert("Service deleted successfully!");
        fetchServices();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service. Please try again.");
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("sidebar.services")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage all services offered
            </p>
          </div>
        </div>

        <Button
          onClick={handleCreate}
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            {t("common.loading")}
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchServices} variant="outline">
              Retry
            </Button>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <Wrench className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p>No services found</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="text-lg">{service.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Fee</p>
                    <p className="text-lg font-bold text-red-600">${service.serviceFee}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Duration</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {service.duration} min
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingService ? "Edit Service" : "Create New Service"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Standard Cleaning"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    placeholder="Describe the service..."
                    className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceFee">Service Fee ($) *</Label>
                    <Input
                      id="serviceFee"
                      type="number"
                      step="0.01"
                      value={formData.serviceFee}
                      onChange={(e) =>
                        setFormData({ ...formData, serviceFee: e.target.value })
                      }
                      required
                      placeholder="50.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (min) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      required
                      placeholder="60"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                  >
                    {editingService ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
