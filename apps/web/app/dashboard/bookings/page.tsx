"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Calendar, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { Booking } from "@/types";

const BookingsPage = () => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.aircon?.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.technician?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.status.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h1 className="text-3xl font-bold">{t("allBookings")}</h1>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search") + "..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
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
                        <p className="text-xs text-muted-foreground">{t("date")}</p>
                        <p className="text-sm font-medium mt-1">
                          {formatDate(booking.bookingForDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Technician</p>
                        <p className="text-sm font-medium mt-1">
                          {booking.technician?.name || "Not assigned"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Services</p>
                        <p className="text-sm font-medium mt-1">
                          {booking.bookingServices?.length || 0} service(s)
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
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
              {searchQuery ? "No bookings found matching your search" : t("noBookingsYet")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingsPage;
