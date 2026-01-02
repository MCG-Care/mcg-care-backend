"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Search,
  User,
  Star,
  Mail,
  Phone,
  MapPin,
  Eye,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { Technician } from "@/types";

const TechniciansPage = () => {
  const { t } = useLanguage();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNo: "",
    address: {
      address: "",
      township: "",
      city: "",
      district: "",
    },
  });

  useEffect(() => {
    checkAdmin();
    fetchTechnicians();
  }, []);

  const checkAdmin = () => {
    try {
      const adminUser = localStorage.getItem("admin_user");
      if (adminUser) {
        const user = JSON.parse(adminUser);
        // Check if user is admin by trying to fetch all users
        // We'll verify this when fetching technicians
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error checking admin:", error);
    }
  };

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      const allUsers = Array.isArray(response.data) ? response.data : [];
      
      // Filter for technicians only
      const techniciansData = allUsers.filter(
        (user: any) => user.role === "technician"
      ) as Technician[];

      // Fetch ratings for each technician
      const techniciansWithRatings = await Promise.all(
        techniciansData.map(async (tech) => {
          try {
            const ratingResponse = await api.get(`/users/${tech.id}/average-rating`);
            return {
              ...tech,
              averageRating: ratingResponse.data.averageRating || 0,
              totalFeedbacks: ratingResponse.data.totalFeedbacks || 0,
            };
          } catch (error) {
            return {
              ...tech,
              averageRating: 0,
              totalFeedbacks: 0,
            };
          }
        })
      );

      setTechnicians(techniciansWithRatings);
    } catch (error: any) {
      console.error("Error fetching technicians:", error);
      if (error.response?.status === 403) {
        setIsAdmin(false);
        alert("Only admins can view technicians");
      } else {
        alert("Failed to fetch technicians");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setIsEditing(false);
    setIsViewing(false);
    setSelectedTechnician(null);
    resetForm();
  };

  const handleView = async (technician: Technician) => {
    try {
      // Fetch full technician details
      const response = await api.get(`/users/${technician.id}`);
      const techData = response.data;
      
      // Fetch rating if not already included
      let ratingData = { averageRating: 0, totalFeedbacks: 0 };
      try {
        const ratingResponse = await api.get(`/users/${technician.id}/average-rating`);
        ratingData = ratingResponse.data;
      } catch (error) {
        // Rating might not exist, that's okay
      }

      setSelectedTechnician({
        ...techData,
        averageRating: ratingData.averageRating || techData.averageRating || 0,
        totalFeedbacks: ratingData.totalFeedbacks || techData.totalFeedbacks || 0,
      });
      setIsViewing(true);
      setIsEditing(false);
      setIsCreating(false);
    } catch (error) {
      console.error("Error fetching technician details:", error);
      setSelectedTechnician(technician);
      setIsViewing(true);
      setIsEditing(false);
      setIsCreating(false);
    }
  };

  const handleEdit = (technician: Technician) => {
    setSelectedTechnician(technician);
    setIsEditing(true);
    setIsViewing(false);
    setIsCreating(false);
    setFormData({
      name: technician.name || "",
      email: technician.email || "",
      password: "", // Don't pre-fill password
      phoneNo: technician.phoneNo || "",
      address: technician.address || {
        address: "",
        township: "",
        city: "",
        district: "",
      },
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phoneNo: "",
      address: {
        address: "",
        township: "",
        city: "",
        district: "",
      },
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (isEditing && selectedTechnician) {
        // Update technician
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          phoneNo: formData.phoneNo,
          address: formData.address,
        };

        // Only include password if provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        await api.patch(`/users/${selectedTechnician.id}`, updateData);
      } else {
        // Create technician
        await api.post("/auth/register", {
          ...formData,
          role: "technician",
        });
      }

      await fetchTechnicians();
      handleCancel();
    } catch (error: any) {
      console.error("Error saving technician:", error);
      alert(error.response?.data?.message || "Failed to save technician");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this technician?")) return;

    try {
      await api.delete(`/users/${id}`);
      await fetchTechnicians();
      if (selectedTechnician?.id === id) {
        handleCancel();
      }
    } catch (error: any) {
      console.error("Error deleting technician:", error);
      alert(error.response?.data?.message || "Failed to delete technician");
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setIsViewing(false);
    setSelectedTechnician(null);
    resetForm();
  };

  const filteredTechnicians = technicians.filter((technician) => {
    const matchesSearch =
      technician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technician.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technician.phoneNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technician.address?.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technician.address?.district.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
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
        <h1 className="text-3xl font-bold">{t("technicians")}</h1>
        {isAdmin && (
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Technician
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search technicians by name, email, phone, city, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechnicians.map((technician) => (
          <Card
            key={technician.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleView(technician)}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 gap-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <CardTitle className="text-lg truncate w-full">{technician.name}</CardTitle>
                  <p className="text-sm text-muted-foreground truncate w-full">
                    {technician.email}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{technician.phoneNo}</span>
                </div>
                {technician.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate">
                      {technician.address.city}, {technician.address.district}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">
                    {technician.averageRating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({technician.totalFeedbacks || 0} reviews)
                  </span>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(technician);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(technician);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(technician.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTechnicians.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {searchQuery
                ? "No technicians found matching your search"
                : "No technicians available"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* View/Edit/Create Modal */}
      {(isViewing || isEditing || isCreating) && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleCancel}
        >
          <Card
            className="w-full max-w-4xl bg-background my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle>
                {isCreating
                  ? "Create Technician"
                  : isEditing
                  ? "Edit Technician"
                  : selectedTechnician?.name || ""}
              </CardTitle>
              <div className="flex gap-2">
                {isViewing && isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedTechnician) handleEdit(selectedTechnician);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 max-h-[70vh] overflow-y-auto">
              {isViewing && selectedTechnician ? (
                // View Mode
                <div className="space-y-6">
                  {/* Rating Section */}
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold">
                        {selectedTechnician.averageRating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedTechnician.totalFeedbacks || 0} reviews
                    </div>
                  </div>

                  {/* Technician Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Name</Label>
                      <p className="font-medium">{selectedTechnician.name || ""}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Email</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedTechnician.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Phone</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedTechnician.phoneNo}
                      </p>
                    </div>
                    {selectedTechnician.address && (
                      <>
                        <div>
                          <Label className="text-sm text-muted-foreground">Address</Label>
                          <p className="font-medium">{selectedTechnician.address.address}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Township</Label>
                          <p className="font-medium">{selectedTechnician.address.township}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">City</Label>
                          <p className="font-medium">{selectedTechnician.address.city}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">District</Label>
                          <p className="font-medium">{selectedTechnician.address.district}</p>
                        </div>
                      </>
                    )}
                    {selectedTechnician.createdAt && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Created At</Label>
                        <p className="font-medium">
                          {new Date(selectedTechnician.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Edit/Create Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g., John Technician"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="e.g., john@example.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNo">Phone Number *</Label>
                      <Input
                        id="phoneNo"
                        value={formData.phoneNo}
                        onChange={(e) =>
                          setFormData({ ...formData, phoneNo: e.target.value })
                        }
                        placeholder="e.g., 09123456789"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">
                        Password {isEditing ? "(leave blank to keep current)" : "*"}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder={isEditing ? "Enter new password" : "Enter password"}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="address">Street Address *</Label>
                        <Input
                          id="address"
                          value={formData.address.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, address: e.target.value },
                            })
                          }
                          placeholder="e.g., 123 Main St"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="township">Township *</Label>
                        <Input
                          id="township"
                          value={formData.address.township}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, township: e.target.value },
                            })
                          }
                          placeholder="e.g., Mayangone"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={formData.address.city}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, city: e.target.value },
                            })
                          }
                          placeholder="e.g., Yangon"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="district">District *</Label>
                        <Input
                          id="district"
                          value={formData.address.district}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, district: e.target.value },
                            })
                          }
                          placeholder="e.g., Yangon"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={
                        saving ||
                        !formData.name ||
                        !formData.email ||
                        !formData.phoneNo ||
                        (!isEditing && !formData.password) ||
                        !formData.address.address ||
                        !formData.address.township ||
                        !formData.address.city ||
                        !formData.address.district
                      }
                      className="flex-1 gap-2"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {isEditing ? "Update" : "Create"}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TechniciansPage;
