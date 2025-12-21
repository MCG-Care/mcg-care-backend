"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Eye, Filter, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingDetailsModal } from "@/components/modals/booking-details-modal";

const API_BASE_URL = "https://mcg-care-backend.onrender.com";

interface Booking {
  id: number;
  aircon?: {
    customer?: {
      name?: string;
    };
    name?: string;
  };
  bookingServices?: Array<{
    service?: {
      name?: string;
    };
  }>;
  bookingForDate?: string;
  bookingTime?: string;
  status: string;
  fees?: string;
  technician?: {
    name?: string;
  };
}

export default function BookingsPage() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        setError("Please login to view bookings");
        setLoading(false);
        return;
      }

      let url = `${API_BASE_URL}/bookings?page=${currentPage}&limit=10`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }

      console.log("Fetching bookings from:", url);
      console.log("Using token:", authToken.substring(0, 20) + "...");

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Bookings Response:", data);
        setBookings(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
      } else {
        const errorText = await response.text();
        console.error("Bookings API Error:", response.status, errorText);
        if (response.status === 401) {
          setError("Authentication failed. Please login again.");
        } else {
          setError(`Failed to load bookings: ${response.status}`);
        }
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/[_-]/g, "");
    switch (normalizedStatus) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "inprogress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "unsuccessful":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    // If it's a number (hour), format it
    if (!isNaN(Number(timeString))) {
      const hour = Number(timeString);
      return `${hour}:00`;
    }
    return timeString;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("sidebar.bookings")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage all your bookings here
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="inprogress">In Progress</option>
            <option value="done">Done</option>
            <option value="unsuccessful">Unsuccessful</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {t("common.loading")}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchBookings} variant="outline">
                Retry
              </Button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p>No bookings found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Service
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Technician
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Time
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Fees
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm">#{booking.id}</td>
                        <td className="py-3 px-4 text-sm">
                          {booking.aircon?.customer?.name || "Unknown"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {booking.bookingServices && booking.bookingServices.length > 0
                            ? booking.bookingServices
                                .map((bs) => bs.service?.name)
                                .filter(Boolean)
                                .join(", ")
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {booking.technician?.name || "Not Assigned"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {formatDate(booking.bookingForDate)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {formatTime(booking.bookingTime)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          ${booking.fees || "0.00"}
                        </td>
                        <td className="py-3 px-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={() => {
            setSelectedBooking(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
}

