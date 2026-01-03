"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Search,
  Calendar as CalendarIcon,
  ArrowRight,
  X,
  Edit,
  Trash2,
  Save,
  Image as ImageIcon,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { Booking } from "@/types";
import Image from "next/image";

type SortBy = "bookingForDate" | "bookingOnDate" | null;
type SortOrder = "asc" | "desc";
type DateRangeType = "single" | "range";

const BookingsPage = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("single");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  
  // Sort states - default to newest first (by createdAt)
  const [sortBy, setSortBy] = useState<SortBy>("bookingOnDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState(false);
  const [bookingFormData, setBookingFormData] = useState<Partial<Booking>>({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings");
      
      const bookingsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

  const openBookingModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setBookingFormData({
      status: booking.status,
      fees: booking.fees,
      description: booking.description,
      bookingForDate: booking.bookingForDate,
    });
    setEditingBooking(false);
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      await api.patch(`/bookings/${selectedBooking.id}`, bookingFormData);
      await fetchBookings();
      setEditingBooking(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking");
    }
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;
    
    if (!confirm("Are you sure you want to delete this booking?")) return;
    
    try {
      await api.delete(`/bookings/${selectedBooking.id}`);
      await fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setDateRangeType("single");
    setDateFrom("");
    setDateTo("");
  };

  const clearSort = () => {
    setSortBy("bookingOnDate"); // Reset to default: newest first
    setSortOrder("desc");
  };

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let result = [...bookings];

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (booking) =>
          booking.aircon?.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.technician?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((booking) => booking.status === statusFilter);
    }

    // Date filter
    if (dateRangeType === "single" && dateFrom) {
      result = result.filter((booking) => {
        const bookingDate = new Date(booking.bookingForDate).toISOString().split("T")[0];
        return bookingDate === dateFrom;
      });
    } else if (dateRangeType === "range" && dateFrom && dateTo) {
      result = result.filter((booking) => {
        const bookingDate = new Date(booking.bookingForDate).toISOString().split("T")[0];
        return bookingDate >= dateFrom && bookingDate <= dateTo;
      });
    }

    // Sorting - always sort (default to newest first by createdAt)
    result.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      if (sortBy === "bookingForDate") {
        aValue = new Date(a.bookingForDate);
        bValue = new Date(b.bookingForDate);
      } else if (sortBy === "bookingOnDate") {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else {
        // Default: sort by createdAt (newest first)
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [bookings, searchQuery, statusFilter, dateRangeType, dateFrom, dateTo, sortBy, sortOrder]);

  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field with default desc order
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: SortBy) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
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
        <h1 className="text-m font-bold">{t("allBookings")}</h1>
      </div>

      {/* Filters and Sort */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>{t("filtersAndSort")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              {t("bookingsSearchHint")}
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search") + "..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">{t("status")}</Label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t("allStatuses")}</option>
                <option value="pending">{t("pending")}</option>
                <option value="inprogress">{t("inProgress")}</option>
                <option value="done">{t("done")}</option>
                <option value="unsuccessful">{t("unsuccessful")}</option>
              </select>
            </div>

            {/* Date Range Type */}
            <div>
              <Label className="text-sm font-medium mb-2 block">{t("dateType")}</Label>
              <select
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={dateRangeType}
                onChange={(e) => {
                  setDateRangeType(e.target.value as DateRangeType);
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                <option value="single">{t("singleDate")}</option>
                <option value="range">{t("dateRange")}</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {dateRangeType === "single" ? t("bookingForDate") : t("fromDate")}
              </Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Date To (only show for range) */}
            {dateRangeType === "range" && (
              <div>
                <Label className="text-sm font-medium mb-2 block">{t("toDate")}</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full"
                  min={dateFrom}
                />
              </div>
            )}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Label className="text-sm font-medium">{t("sortBy")}</Label>
            <Button
              variant={sortBy === "bookingForDate" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("bookingForDate")}
              className="gap-2"
            >
              {getSortIcon("bookingForDate")}
              {t("bookingForDate")}
            </Button>
            <Button
              variant={sortBy === "bookingOnDate" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("bookingOnDate")}
              className="gap-2"
            >
              {getSortIcon("bookingOnDate")}
              {t("bookingOnDate")}
            </Button>
            <div className="ml-auto flex gap-2">
              {sortBy && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSort}
                >
                  {t("clearSort")}
                </Button>
              )}
              {(statusFilter !== "all" || dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  {t("clearFilters")}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredAndSortedBookings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredAndSortedBookings.map((booking) => (
            <Card
              key={booking.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openBookingModal(booking)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {booking.aircon?.customer?.name || "Customer"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.aircon?.customer?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("status")}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${getStatusColor(booking.status)}`}>
                          {t(booking.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("bookingFor")}</p>
                        <p className="text-sm font-medium mt-1">
                          {formatDate(booking.bookingForDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("technician")}</p>
                        <p className="text-sm font-medium mt-1">
                          {booking.technician?.name || t("notAssigned")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("services")}</p>
                        <p className="text-sm font-medium mt-1">
                          {booking.bookingServices?.length || 0} {t("serviceCount")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={(e) => {
                    e.stopPropagation();
                    openBookingModal(booking);
                  }}>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {searchQuery || statusFilter !== "all" || dateFrom || dateTo
                ? t("noBookingsFoundMatchingFilters")
                : t("noBookingsYet")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedBooking(null);
            setEditingBooking(false);
          }}
        >
          <Card
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-2xl">{t("bookingDetails")}</CardTitle>
              <div className="flex gap-2">
                {!editingBooking ? (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingBooking(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={handleDeleteBooking}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedBooking(null);
                    setEditingBooking(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Customer Information */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">{t("customerInformation")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t("name")}</Label>
                    <p className="font-medium">
                      {selectedBooking.aircon?.customer?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("email")}</Label>
                    <p className="font-medium">
                      {selectedBooking.aircon?.customer?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("phone")}</Label>
                    <p className="font-medium">
                      {selectedBooking.aircon?.customer?.phoneNo || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("product")}</Label>
                    <p className="font-medium">
                      {selectedBooking.aircon?.product?.name || "N/A"}
                    </p>
                  </div>
                  {selectedBooking.aircon?.name && (
                    <div>
                      <Label className="text-muted-foreground">{t("productNickname")}</Label>
                      <p className="font-medium">
                        {selectedBooking.aircon.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Services */}
              <div>
                <Label className="text-muted-foreground">{t("requestedServices")}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedBooking.bookingServices?.map((s: any) => (
                    <span
                      key={s.service.id}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {s.service?.name} - {s.service?.serviceFee} Ks
                    </span>
                  )) || <p>{t("noServices")}</p>}
                </div>
              </div>

              {/* Technician Information */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">{t("assignedTechnician")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t("name")}</Label>
                    <p className="font-medium">
                      {selectedBooking.technician?.name || t("notAssigned")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("phone")}</Label>
                    <p className="font-medium">
                      {selectedBooking.technician?.phoneNo || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t("status")}</Label>
                  {editingBooking ? (
                    <select
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      value={bookingFormData.status || selectedBooking.status}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, status: e.target.value as any })
                      }
                    >
                      <option value="pending">{t("pending")}</option>
                      <option value="inprogress">{t("inProgress")}</option>
                      <option value="done">{t("done")}</option>
                      <option value="unsuccessful">{t("unsuccessful")}</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm mt-1 ${getStatusColor(
                        selectedBooking.status
                      )}`}
                    >
                      {t(selectedBooking.status)}
                    </span>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("scheduledDate")}</Label>
                  {editingBooking ? (
                    <Input
                      type="datetime-local"
                      value={bookingFormData.bookingForDate?.split('.')[0] || selectedBooking.bookingForDate.split('.')[0]}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, bookingForDate: e.target.value })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium mt-1">
                      {formatDate(selectedBooking.bookingForDate)}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("bookingTime")}</Label>
                  <p className="font-medium mt-1">{selectedBooking.bookingTime || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("duration")}</Label>
                  <p className="font-medium mt-1">{selectedBooking.duration} {t("minutes")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("fees")}</Label>
                  {editingBooking ? (
                    <Input
                      type="text"
                      value={bookingFormData.fees || selectedBooking.fees}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, fees: e.target.value })
                      }
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-medium mt-1">{selectedBooking.fees || "0.00"} Ks</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-muted-foreground">{t("description")}</Label>
                {editingBooking ? (
                  <Textarea
                    value={bookingFormData.description || selectedBooking.description || ""}
                    onChange={(e) =>
                      setBookingFormData({ ...bookingFormData, description: e.target.value })
                    }
                    className="mt-1"
                    rows={4}
                  />
                ) : (
                  <p className="mt-1 whitespace-pre-wrap">
                    {selectedBooking.description || t("noDescriptionProvided")}
                  </p>
                )}
              </div>

              {/* Photos */}
              {selectedBooking.bookingImages && selectedBooking.bookingImages.length > 0 && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {t("photos")} ({selectedBooking.bookingImages.length})
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {selectedBooking.bookingImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative aspect-video rounded-lg overflow-hidden border bg-muted"
                      >
                        <Image
                          src={img.url}
                          alt="Booking image"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground">{t("created")}</Label>
                  <p className="text-sm">{formatDate(selectedBooking.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("lastUpdated")}</Label>
                  <p className="text-sm">{formatDate(selectedBooking.updatedAt)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {editingBooking ? (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="default"
                    onClick={handleUpdateBooking}
                    className="flex-1 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {t("save")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingBooking(false)}
                    className="flex-1"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedBooking(null);
                    setEditingBooking(false);
                  }}
                >
                  {t("close")}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;

