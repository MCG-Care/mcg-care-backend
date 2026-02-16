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
  Wrench,
  Calendar,
  Clock,
  ListChecks,
  CalendarDays,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { Technician, TechnicianService, Timeslot, ServiceType, Booking } from "@/types";
import { formatCurrency, formatHourTo12Hour, formatTimeTo12Hour } from "@/lib/utils";
import TimeOffRequestsModal from "./TimeOffRequestsModal";

// District/City/Township data structure
const addressData = {
  districts: [
    {
      name: "Mandalay",
      nameMm: "မန္တလေး",
      cities: [
        {
          name: "Mandalay",
          nameMm: "မန္တလေး",
          townships: [
            { name: "Aungmyethazan", nameMm: "အောင်မြေသာစံ" },
            { name: "Chanayethazan", nameMm: "ချမ်းအေးသာစံ" },
            { name: "Mahaaungmye", nameMm: "မဟာအောင်မြေ" },
            { name: "Chanmyathazi", nameMm: "ချမ်းမြသာစည်" },
            { name: "Pyigyidagun", nameMm: "ပြည်ကြီးတံခွန်" },
            { name: "Patheingyi", nameMm: "ပုသိမ်ကြီး" },
            { name: "Amarapura", nameMm: "အမရပူရ" },
          ],
        },
        {
          name: "Pyin Oo Lwin",
          nameMm: "ပြင်ဦးလွင်",
          townships: [
            { name: "Pyin Oo Lwin", nameMm: "ပြင်ဦးလွင်" },
            { name: "Madaya", nameMm: "မတ္တရာ" },
            { name: "Mogok", nameMm: "မိုးကုတ်" },
            { name: "Singu", nameMm: "စဉ့်ကူး" },
            { name: "Tagaung", nameMm: "တကောင်း" },
            { name: "Thabeikkyin", nameMm: "သပိတ်ကျင်း" },
          ],
        },
        {
          name: "Kyaukse",
          nameMm: "ကျောက်ဆည်",
          townships: [
            { name: "Kyaukse", nameMm: "ကျောက်ဆည်" },
            { name: "Myittha", nameMm: "မြစ်သား" },
            { name: "Sintgaing", nameMm: "စဉ့်ကိုင်" },
          ],
        },
        {
          name: "Meiktila",
          nameMm: "မိတ္ထီလာ",
          townships: [
            { name: "Meiktila", nameMm: "မိတ္ထီလာ" },
            { name: "Mahlaing", nameMm: "မလှိုင်" },
            { name: "Thazi", nameMm: "သာစည််" },
            { name: "Wundwin", nameMm: "ဝမ်းတွင်း" },
          ],
        },
      ],
    },
    {
      name: "Yangon",
      nameMm: "ရန်ကုန်",
      cities: [
        {
          name: "Eastern Yangon",
          nameMm: "ရန်ကုန်အရှေ့ပိုင်း",
          townships: [
            { name: "Botataung", nameMm: "ဗိုလ်တထောင်" },
            { name: "Dagon Seikkan", nameMm: "ဒဂုံဆိပ်ကမ်း" },
            { name: "Dawbon", nameMm: "ဒေါပုံ" },
            { name: "Mingala Taungnyunt", nameMm: "မင်္ဂလာတောင်ညွန့်" },
            { name: "North Dagon", nameMm: "မြောက်ဒဂုံ" },
            { name: "South Dagon", nameMm: "တောင်ဒဂုံ" },
            { name: "East Dagon", nameMm: "အရှေ့ဒဂုံ" },
            { name: "Thaketa", nameMm: "သာကေတ" },
            { name: "Tamwe", nameMm: "တာမွေ" },
            { name: "Pazundaung", nameMm: "ပုဇွန်တောင်" },
            { name: "Thingangyun", nameMm: "သင်္ကန်းကျွန်း" },
            { name: "Yankin", nameMm: "ရန်ကင်း" },
          ],
        },
        {
          name: "Western Yangon",
          nameMm: "ရန်ကုန်အနောက်ပိုင်း",
          townships: [
            { name: "Ahlone", nameMm: "အလုံ" },
            { name: "Bahan", nameMm: "ဗဟန်း" },
            { name: "Dagon", nameMm: "ဒဂုံ" },
            { name: "Hlaing", nameMm: "လှိုင်" },
            { name: "Kamayut", nameMm: "ကမာရွတ်" },
            { name: "Kyauktada", nameMm: "ကျောက်တံတား" },
            { name: "Kyimyindaing", nameMm: "ကြည့်မြင်တိုင်" },
            { name: "Lanmadaw", nameMm: "လမ်းမတော်" },
            { name: "Latha", nameMm: "လသာ" },
            { name: "Pabedan", nameMm: "ပန်းဘဲတန်း" },
            { name: "Sanchaung", nameMm: "စမ်းချောင်း" },
            { name: "Seikkan", nameMm: "ဆိပ်ကမ်း" },
          ],
        },
        {
          name: "Southern Yangon",
          nameMm: "ရန်ကုန်တောင်ပိုင်း",
          townships: [
            { name: "Cocokyun", nameMm: "ကိုကိုးကျွန်း" },
            { name: "Dala", nameMm: "ဒလ" },
            { name: "Kawhmu", nameMm: "ကော့မှူး" },
            { name: "Khayan", nameMm: "ခရမ်း" },
            { name: "Kungyangon", nameMm: "ကွမ်းခြံကုန်း" },
            { name: "Kyauktan", nameMm: "ကျောက်တန်း" },
            { name: "Seikkyi Kanaungto", nameMm: "ဆိပ်ကြီးခနောင်တို" },
            { name: "Thanlyin", nameMm: "သန်လျင်" },
            { name: "Thongwa", nameMm: "သုံးခွ" },
            { name: "Twantay", nameMm: "တွံတေး" },
          ],
        },
        {
          name: "Northern Yangon",
          nameMm: "ရန်ကုန်မြောက်ပိုင်း",
          townships: [
            { name: "Hlaingthaya", nameMm: "လှိုင်သာယာ" },
            { name: "Hlegu", nameMm: "လှည်းကူး" },
            { name: "Hmawbi", nameMm: "မှော်ဘီ" },
            { name: "Htantabin", nameMm: "ထန်းတပင်" },
            { name: "Insein", nameMm: "အင်းစိန်" },
            { name: "Mingaladon", nameMm: "မင်္ဂလာဒုံ" },
            { name: "Shwepyitha", nameMm: "ရွှေပြည်သာ" },
            { name: "Taikkyi", nameMm: "တိုက်ကြီး" },
          ],
        },
      ],
    },
  ],
};

const TechniciansPage = () => {
  const { t, language } = useLanguage();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [technicianServices, setTechnicianServices] = useState<ServiceType[]>([]);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingTimeslots, setLoadingTimeslots] = useState(false);
  const [updatingTimeslot, setUpdatingTimeslot] = useState<string | null>(null);
  const [allServices, setAllServices] = useState<ServiceType[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [loadingAllServices, setLoadingAllServices] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [technicianBookings, setTechnicianBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showTimeOffRequestsModal, setShowTimeOffRequestsModal] = useState(false);
  const [pendingTimeOffCount, setPendingTimeOffCount] = useState<number>(0);
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
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedTownship, setSelectedTownship] = useState<string>("");

  // Helper functions to get available options
  const getDistricts = () => {
    return addressData.districts.map((d) => ({
      value: d.name, // Always use English for database
      label: language === "my" ? d.nameMm : d.name, // Show Burmese in UI if language is my
    }));
  };

  const getCitiesForDistrict = (districtName: string) => {
    const district = addressData.districts.find((d) => d.name === districtName);
    if (!district) return [];
    return district.cities.map((c) => ({
      value: c.name, // Always use English for database
      label: language === "my" ? c.nameMm : c.name, // Show Burmese in UI if language is my
    }));
  };

  const getTownshipsForCity = (districtName: string, cityName: string) => {
    const district = addressData.districts.find((d) => d.name === districtName);
    if (!district) return [];
    const city = district.cities.find((c) => c.name === cityName);
    if (!city) return [];
    return city.townships.map((t) => ({
      value: t.name, // Always use English for database
      label: language === "my" ? t.nameMm : t.name, // Show Burmese in UI if language is my
    }));
  };

  useEffect(() => {
    checkAdmin();
    fetchTechnicians();
    fetchAllServices();
  }, []);

  const fetchPendingTimeOffCount = async () => {
    if (!isAdmin) return;
    try {
      const response = await api.get("/time-off-requests?status=pending");
      const data = Array.isArray(response.data) ? response.data : [];
      setPendingTimeOffCount(data.length);
    } catch {
      setPendingTimeOffCount(0);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPendingTimeOffCount();
    }
  }, [isAdmin]);

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

      // Sort by createdAt descending (newest first)
      techniciansWithRatings.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      });

      setTechnicians(techniciansWithRatings);
    } catch (error: any) {
      console.error("Error fetching technicians:", error);
      if (error.response?.status === 403) {
        setIsAdmin(false);
        alert(t("onlyAdminsCanViewTechnicians"));
      } else {
        alert(t("failedToFetchTechnicians"));
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
    setSelectedServiceIds([]);
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

      // Fetch technician services
      fetchTechnicianServices(technician.id);
      
      // Fetch all timeslots for this technician
      fetchTechnicianTimeslots(technician.id);
    } catch (error) {
      console.error("Error fetching technician details:", error);
      setSelectedTechnician(technician);
      setIsViewing(true);
      setIsEditing(false);
      setIsCreating(false);
    }
  };

  const fetchAllServices = async () => {
    try {
      setLoadingAllServices(true);
      const response = await api.get("/service-types");
      const servicesData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setAllServices(servicesData);
    } catch (error) {
      console.error("Error fetching all services:", error);
      setAllServices([]);
    } finally {
      setLoadingAllServices(false);
    }
  };

  const fetchTechnicianServices = async (technicianId: string) => {
    try {
      setLoadingServices(true);
      const response = await api.get(`/technician-services/technician/${technicianId}`);
      // API returns { technicianId, technicianName, services: ServiceType[] }
      const services = response.data?.services || [];
      setTechnicianServices(Array.isArray(services) ? services : []);
    } catch (error) {
      console.error("Error fetching technician services:", error);
      setTechnicianServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchTechnicianTimeslots = async (technicianId: string) => {
    try {
      setLoadingTimeslots(true);
      const response = await api.get(`/timeslots?technicianId=${technicianId}`);
      const timeslotsData = Array.isArray(response.data) ? response.data : [];
      // Sort by date
      timeslotsData.sort((a: Timeslot, b: Timeslot) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setTimeslots(timeslotsData);
    } catch (error) {
      console.error("Error fetching timeslots:", error);
      setTimeslots([]);
    } finally {
      setLoadingTimeslots(false);
    }
  };

  const handleToggleSlot = async (timeslotId: string, hour: number, currentSlots: number[]) => {
    if (updatingTimeslot === timeslotId) return; // Prevent double clicks

    try {
      setUpdatingTimeslot(timeslotId);
      
      // Toggle the slot
      const isSlotAvailable = currentSlots.includes(hour);
      const updatedSlots = isSlotAvailable
        ? currentSlots.filter((s) => s !== hour) // Remove slot (block it)
        : [...currentSlots, hour].sort((a, b) => a - b); // Add slot (unblock it)

      // Update the timeslot
      await api.patch(`/timeslots/${timeslotId}`, { slots: updatedSlots });

      // Update local state
      setTimeslots((prev) =>
        prev.map((ts) =>
          ts.id === timeslotId ? { ...ts, slots: updatedSlots } : ts
        )
      );
    } catch (error: any) {
      console.error("Error updating timeslot:", error);
      alert(error.response?.data?.message || t("failedToUpdateTimeslot"));
    } finally {
      setUpdatingTimeslot(null);
    }
  };

  const formatHour = (hour: number) => {
    return formatHourTo12Hour(hour);
  };

  const handleEdit = async (technician: Technician) => {
    setSelectedTechnician(technician);
    setIsEditing(true);
    setIsViewing(false);
    setIsCreating(false);
    
    const district = technician.address?.district || "";
    const city = technician.address?.city || "";
    const township = technician.address?.township || "";
    
    setFormData({
      name: technician.name || "",
      email: technician.email || "",
      password: "", // Don't pre-fill password
      phoneNo: technician.phoneNo || "",
      address: technician.address ? {
        address: technician.address.address || "",
        township: township,
        city: city,
        district: district,
      } : {
        address: "",
        township: "",
        city: "",
        district: "",
      },
    });
    
    // Set selected dropdown values
    setSelectedDistrict(district);
    setSelectedCity(city);
    setSelectedTownship(township);
    
    // Fetch current services for this technician
    try {
      const response = await api.get(`/technician-services/technician/${technician.id}`);
      const services = response.data?.services || [];
      setSelectedServiceIds(services.map((s: ServiceType) => s.id.toString()));
    } catch (error) {
      console.error("Error fetching technician services for edit:", error);
      setSelectedServiceIds([]);
    }
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
    setSelectedDistrict("");
    setSelectedCity("");
    setSelectedTownship("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (isEditing && selectedTechnician) {
        // Update technician basic info (without address)
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          phoneNo: formData.phoneNo,
        };

        // Only include password if provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        await api.patch(`/users/${selectedTechnician.id}`, updateData);
        
        // Update address separately if address fields are provided
        if (formData.address.address && formData.address.township && formData.address.city && formData.address.district) {
          try {
            // Check if user has a primary address
            if (selectedTechnician.primaryAddressId && selectedTechnician.address) {
              // Update existing primary address
              await api.patch(`/users/${selectedTechnician.id}/addresses/${selectedTechnician.primaryAddressId}`, {
                address: formData.address.address,
                township: formData.address.township,
                city: formData.address.city,
                district: formData.address.district,
              });
            } else {
              // Create new address and set as primary
              const addressResponse = await api.post(`/users/${selectedTechnician.id}/addresses`, {
                address: formData.address.address,
                township: formData.address.township,
                city: formData.address.city,
                district: formData.address.district,
              });
              
              // Set as primary address
              if (addressResponse.data?.id) {
                await api.patch(`/users/${selectedTechnician.id}/primary-address/${addressResponse.data.id}`);
              }
            }
          } catch (error) {
            console.error("Error updating address:", error);
            // Don't fail the whole operation if address update fails
          }
        }
        
        // Update services
        try {
          // Get current services
          const currentServicesResponse = await api.get(
            `/technician-services/technician/${selectedTechnician.id}`
          );
          const currentServices = currentServicesResponse.data?.services || [];
          const currentServiceIds = currentServices.map((s: ServiceType) => s.id.toString());
          
          // Find services to remove (in current but not in selected)
          const servicesToRemove = currentServiceIds.filter(
            (id: string) => !selectedServiceIds.includes(id)
          );
          
          // Find services to add (in selected but not in current)
          const servicesToAdd = selectedServiceIds.filter(
            (id: string) => !currentServiceIds.includes(id)
          );
          
          // Remove services
          for (const serviceId of servicesToRemove) {
            try {
              await api.delete(
                `/technician-services/technician/${selectedTechnician.id}/service/${serviceId}`
              );
            } catch (error) {
              console.error(`Error removing service ${serviceId}:`, error);
            }
          }
          
          // Add new services
          if (servicesToAdd.length > 0) {
            await api.post("/technician-services/assign", {
              technicianId: parseInt(selectedTechnician.id),
              serviceIds: servicesToAdd.map((id) => parseInt(id)),
            });
          }
        } catch (error) {
          console.error("Error updating services:", error);
          // Don't fail the whole operation if service update fails
        }
      } else {
        // Create technician
        const createResponse = await api.post("/auth/register", {
          ...formData,
          role: "technician",
        });
        
        // Assign services if any are selected
        // The register endpoint returns { access_token, user: {...} }
        const newTechnicianId = createResponse.data?.user?.id;
        if (selectedServiceIds.length > 0 && newTechnicianId) {
          try {
            await api.post("/technician-services/assign", {
              technicianId: typeof newTechnicianId === 'string' ? parseInt(newTechnicianId) : newTechnicianId,
              serviceIds: selectedServiceIds.map((id) => parseInt(id)),
            });
          } catch (error) {
            console.error("Error assigning services:", error);
            // Don't fail the whole operation if service assignment fails
          }
        }
      }

      await fetchTechnicians();
      handleCancel();
    } catch (error: any) {
      console.error("Error saving technician:", error);
      alert(error.response?.data?.message || t("failedToSaveTechnician"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("areYouSureDeleteTechnician"))) return;

    try {
      await api.delete(`/users/${id}`);
      await fetchTechnicians();
      if (selectedTechnician?.id === id) {
        handleCancel();
      }
    } catch (error: any) {
      console.error("Error deleting technician:", error);
      alert(error.response?.data?.message || t("failedToDeleteTechnician"));
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setIsViewing(false);
    setSelectedTechnician(null);
    setTechnicianServices([]);
    setTimeslots([]);
    setSelectedServiceIds([]);
    setShowBookingsModal(false);
    setTechnicianBookings([]);
    resetForm();
  };

  const fetchTechnicianBookings = async (technicianId: string) => {
    try {
      setLoadingBookings(true);
      const response = await api.get(`/bookings?technicianId=${technicianId}`);
      const bookingsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      // Sort by bookingForDate descending (newest first)
      bookingsData.sort((a: Booking, b: Booking) => 
        new Date(b.bookingForDate).getTime() - new Date(a.bookingForDate).getTime()
      );
      setTechnicianBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching technician bookings:", error);
      alert(t("failedToFetchBookings") || "Failed to fetch bookings");
      setTechnicianBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleViewBookings = async () => {
    if (selectedTechnician) {
      await fetchTechnicianBookings(selectedTechnician.id);
      setShowBookingsModal(true);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
      confirmed: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
      in_progress: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
      inprogress: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
      completed: "text-green-600 bg-green-100 dark:bg-green-900/20",
      done: "text-green-600 bg-green-100 dark:bg-green-900/20",
      cancelled: "text-red-600 bg-red-100 dark:bg-red-900/20",
      unsuccessful: "text-red-600 bg-red-100 dark:bg-red-900/20",
    };
    return colors[status] || "text-gray-600 bg-gray-100";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredTechnicians = technicians.filter((technician) => {
    const matchesSearch =
      technician.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technician.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technician.phoneNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technician.address?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technician.address?.district?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Client-side pagination
  const paginatedTechnicians = filteredTechnicians.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredTechnicians.length / pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

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
        <h1 className="text-m font-bold">{t("manageTechnicians")}</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTimeOffRequestsModal(true)}
              className="gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              {t("checkRequests")}
              {pendingTimeOffCount > 0 && (
                <span className="ml-1 flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-medium text-white">
                  {pendingTimeOffCount}
                </span>
              )}
            </Button>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("addTechnician")}
            </Button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchTechnicians")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pagination Info */}
      {!loading && filteredTechnicians.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredTechnicians.length)} of {filteredTechnicians.length} technicians
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

      {/* Technicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedTechnicians.map((technician) => (
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
                    ({technician.totalFeedbacks || 0} {t("reviews")})
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
                    {t("view")}
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

      {filteredTechnicians.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {searchQuery
                ? t("noTechniciansFound")
                : t("noTechniciansAvailable")}
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
            className="w-full max-w-5xl bg-background my-8 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b flex-shrink-0">
              <CardTitle>
                {isCreating
                  ? t("createTechnician")
                  : isEditing
                  ? t("editTechnician")
                  : selectedTechnician?.name || ""}
              </CardTitle>
              <div className="flex gap-2">
                {isViewing && isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewBookings}
                      className="gap-2"
                    >
                      <ListChecks className="h-4 w-4" />
                      {t("viewBookings") || "View Bookings"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedTechnician) handleEdit(selectedTechnician);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t("edit")}
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 overflow-y-auto flex-1 pb-4">
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
                      {selectedTechnician.totalFeedbacks || 0} {t("reviews")}
                    </div>
                  </div>

                  {/* Technician Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">{t("name")}</Label>
                      <p className="font-medium">{selectedTechnician.name || ""}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">{t("email")}</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedTechnician.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">{t("phone")}</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedTechnician.phoneNo}
                      </p>
                    </div>
                    {selectedTechnician.address ? (
                      <>
                        <div>
                          <Label className="text-sm text-muted-foreground">{t("address")}</Label>
                          <p className="font-medium">{selectedTechnician.address.address || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">{t("township")}</Label>
                          <p className="font-medium">{selectedTechnician.address.township || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">{t("city")}</Label>
                          <p className="font-medium">{selectedTechnician.address.city || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">{t("district")}</Label>
                          <p className="font-medium">{selectedTechnician.address.district || "N/A"}</p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t("address")}</Label>
                        <p className="font-medium text-muted-foreground">No address on file</p>
                      </div>
                    )}
                    {selectedTechnician.createdAt && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t("createdAt")}</Label>
                        <p className="font-medium">
                          {new Date(selectedTechnician.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Services Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Wrench className="h-5 w-5" />
                      <Label className="text-lg font-semibold">{t("offeringServices")}</Label>
                    </div>
                    {loadingServices ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : technicianServices.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {technicianServices.map((service) => (
                          <Card key={service.id} className="p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{service.name || t("unknownService")}</p>
                                {service.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {service.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <span>{t("fee")}: {service.serviceFee ? formatCurrency(service.serviceFee) : "N/A"} Ks</span>
                                  <span>{t("durationMin")}: {service.duration || "N/A"} {t("min")}</span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        {t("noServicesAssigned")}
                      </p>
                    )}
                  </div>

                  {/* Timeslots Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="h-5 w-5" />
                      <Label className="text-lg font-semibold">{t("availabilitySchedule")}</Label>
                    </div>
                    {loadingTimeslots ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : timeslots.length > 0 ? (
                      <div className="space-y-4">
                        {timeslots.map((timeslot) => (
                          <Card key={timeslot.id} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {new Date(timeslot.date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {timeslot.slots.length} {t("slotsAvailable")}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {[9, 10, 11, 12, 13, 14, 15, 16].map((hour) => {
                                const isAvailable = timeslot.slots.includes(hour);
                                const isUpdating = updatingTimeslot === timeslot.id;
                                return (
                                  <button
                                    key={hour}
                                    onClick={() =>
                                      handleToggleSlot(timeslot.id, hour, timeslot.slots)
                                    }
                                    disabled={isUpdating}
                                    className={`
                                      px-3 py-2 rounded-md text-sm font-medium transition-all
                                      ${
                                        isAvailable
                                          ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
                                          : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                                      }
                                      ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                    `}
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatHour(hour)}
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        {t("noTimeslotsAvailable")}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                // Edit/Create Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t("name")} *</Label>
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
                      <Label htmlFor="email">{t("email")} *</Label>
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
                      <Label htmlFor="phoneNo">{t("phoneNumber")} *</Label>
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
                        {t("password")} {isEditing ? `(${t("passwordLeaveBlank")})` : "*"}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder={isEditing ? t("enterNewPassword") : t("enterPassword")}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">{t("address")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="address">{t("streetAddress")} *</Label>
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
                        <Label htmlFor="district">{t("district")} *</Label>
                        <select
                          id="district"
                          value={selectedDistrict}
                          onChange={(e) => {
                            const district = e.target.value;
                            setSelectedDistrict(district);
                            setSelectedCity(""); // Reset city when district changes
                            setSelectedTownship(""); // Reset township when district changes
                            setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                district: district,
                                city: "",
                                township: "",
                              },
                            });
                          }}
                          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">{t("selectDistrict")}</option>
                          {getDistricts().map((district) => (
                            <option key={district.value} value={district.value}>
                              {district.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="city">{t("city")} *</Label>
                        <select
                          id="city"
                          value={selectedCity}
                          onChange={(e) => {
                            const city = e.target.value;
                            setSelectedCity(city);
                            setSelectedTownship(""); // Reset township when city changes
                            setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                city: city,
                                township: "",
                              },
                            });
                          }}
                          disabled={!selectedDistrict}
                          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">{t("selectCity")}</option>
                          {selectedDistrict &&
                            getCitiesForDistrict(selectedDistrict).map((city) => (
                              <option key={city.value} value={city.value}>
                                {city.label}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="township">{t("township")} *</Label>
                        <select
                          id="township"
                          value={selectedTownship}
                          onChange={(e) => {
                            const township = e.target.value;
                            setSelectedTownship(township);
                            setFormData({
                              ...formData,
                              address: {
                                ...formData.address,
                                township: township,
                              },
                            });
                          }}
                          disabled={!selectedCity}
                          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">{t("selectTownship")}</option>
                          {selectedDistrict &&
                            selectedCity &&
                            getTownshipsForCity(selectedDistrict, selectedCity).map((township) => (
                              <option key={township.value} value={township.value}>
                                {township.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Services Assignment Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Wrench className="h-5 w-5" />
                      <Label className="text-lg font-semibold">{t("assignServices")}</Label>
                    </div>
                    {loadingAllServices ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : allServices.length > 0 ? (
                      <div className="space-y-2">
                        {allServices.map((service) => (
                          <label
                            key={service.id}
                            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedServiceIds.includes(service.id.toString())}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedServiceIds([
                                    ...selectedServiceIds,
                                    service.id.toString(),
                                  ]);
                                } else {
                                  setSelectedServiceIds(
                                    selectedServiceIds.filter((id) => id !== service.id.toString())
                                  );
                                }
                              }}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{service.name}</p>
                              {service.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {service.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>{t("fee")}: {formatCurrency(service.serviceFee)} Ks</span>
                                <span>{t("durationMin")}: {service.duration} {t("min")}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        {t("noServicesAvailableCreate")}
                      </p>
                    )}
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

      {/* Bookings Modal */}
      {showBookingsModal && selectedTechnician && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowBookingsModal(false)}
        >
          <Card
            className="w-full max-w-6xl bg-background my-8 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b flex-shrink-0">
              <CardTitle>
                {t("bookingsFor") || "Bookings for"} {selectedTechnician.name}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowBookingsModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 overflow-y-auto flex-1">
              {loadingBookings ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : technicianBookings.length > 0 ? (
                <div className="space-y-4">
                  {technicianBookings.map((booking) => (
                    <Card key={booking.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(booking.bookingForDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{formatTimeTo12Hour(booking.bookingTime)}</span>
                            </div>
                          </div>
                          
                          {booking.aircon && (
                            <div className="space-y-1">
                              <p className="font-medium">
                                {t("aircon") || "Aircon"}: {booking.aircon.name}
                              </p>
                              {booking.aircon.customer && (
                                <p className="text-sm text-muted-foreground">
                                  {t("customer") || "Customer"}: {booking.aircon.customer.name} ({booking.aircon.customer.phoneNo})
                                </p>
                              )}
                              {booking.aircon.product && (
                                <p className="text-sm text-muted-foreground">
                                  {t("product") || "Product"}: {booking.aircon.product.name}
                                </p>
                              )}
                            </div>
                          )}

                          {booking.bookingServices && booking.bookingServices.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1">
                                {t("services") || "Services"}:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {booking.bookingServices.map((bs, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-muted rounded-md text-xs"
                                  >
                                    {bs.service.name} ({formatCurrency(bs.service.serviceFee)} Ks)
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {booking.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {booking.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm mt-2">
                            <span className="text-muted-foreground">
                              {t("duration") || "Duration"}: {booking.duration} {t("min") || "min"}
                            </span>
                            <span className="text-muted-foreground">
                              {t("fees") || "Fees"}: {formatCurrency(booking.fees)} Ks
                            </span>
                          </div>
                        </div>

                        {booking.bookingImages && booking.bookingImages.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {booking.bookingImages.slice(0, 3).map((image) => (
                              <div
                                key={image.id}
                                className="w-20 h-20 rounded-md overflow-hidden border bg-muted"
                              >
                                <img
                                  src={image.url}
                                  alt="Booking"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {booking.bookingImages.length > 3 && (
                              <div className="w-20 h-20 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                +{booking.bookingImages.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {t("noBookingsFound") || "No bookings found for this technician"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Time Off Requests Modal */}
      <TimeOffRequestsModal
        isOpen={showTimeOffRequestsModal}
        onClose={() => {
          setShowTimeOffRequestsModal(false);
          fetchPendingTimeOffCount();
        }}
      />
    </div>
  );
};

export default TechniciansPage;
