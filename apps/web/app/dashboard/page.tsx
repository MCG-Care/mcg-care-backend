"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Clock, TrendingUp, Calendar, CalendarClock, Eye } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingDetailsModal } from "@/components/modals/booking-details-modal";
import { ForumPostModal } from "@/components/modals/forum-post-modal";

const API_BASE_URL = "https://mcg-care-backend.onrender.com";

interface Booking {
  id: number;
  customerName?: string;
  aircon?: {
    customer?: {
      name?: string;
    };
  };
  customer?: {
    name?: string;
  };
  bookingServices?: Array<{
    service?: {
      name?: string;
    };
  }>;
  serviceType?: {
    name?: string;
  };
  serviceTypeName?: string;
  bookingForDate?: string;
  scheduledDate?: string;
  status: string;
}

interface ForumPost {
  id: number;
  title: string;
  user?: {
    name?: string;
  };
  author?: string;
  category?: string;
  commentCount?: number;
  createdAt?: string;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStats, setBookingStats] = useState({
    pending: 0,
    inprogress: 0,
    today: 0,
    upcoming: 0,
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        console.warn("No auth token found. Please login first.");
        setError("Please login to view bookings");
        setLoading(false);
        return;
      }

      console.log("Fetching bookings with token:", authToken.substring(0, 20) + "...");

      // Fetch bookings
      const bookingsResponse = await fetch(`${API_BASE_URL}/bookings?page=1&limit=5`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Bookings response status:", bookingsResponse.status);

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        console.log("Bookings API Response:", bookingsData);
        const allBookings = bookingsData.data || bookingsData || [];
        setBookings(allBookings);

        // Calculate stats from all bookings
        const today = new Date().toISOString().split("T")[0];
        const stats = {
          pending: 0,
          inprogress: 0,
          today: 0,
          upcoming: 0,
        };

        // Fetch all bookings for stats (not just first 5)
        const allBookingsResponse = await fetch(`${API_BASE_URL}/bookings?page=1&limit=1000`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (allBookingsResponse.ok) {
          const allBookingsData = await allBookingsResponse.json();
          const allBookingsList = allBookingsData.data || [];

          allBookingsList.forEach((booking: Booking) => {
            const bookingDate = booking.bookingForDate || booking.scheduledDate || "";
            const status = booking.status.toLowerCase().replace(/[_-]/g, "");

            // Count by status
            if (status === "pending") stats.pending++;
            if (status === "inprogress") stats.inprogress++;

            // Count today's bookings
            if (bookingDate.startsWith(today)) stats.today++;

            // Count upcoming bookings (future dates)
            if (bookingDate > today) stats.upcoming++;
          });

          setBookingStats(stats);
          console.log("Booking Stats:", stats);
        }
      } else {
        const errorText = await bookingsResponse.text();
        console.error("Bookings API Error:", bookingsResponse.status, errorText);
        if (bookingsResponse.status === 401) {
          setError("Authentication failed. Please login again.");
        }
      }

      // Fetch forum posts
      const postsResponse = await fetch(`${API_BASE_URL}/forum/posts?page=1&limit=5`);

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        console.log("Forum Posts API Response:", postsData);
        setForumPosts(postsData.data || postsData || []);
      } else {
        console.error("Forum Posts API Error:", postsResponse.status, await postsResponse.text());
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: t("dashboard.pending"),
      value: bookingStats.pending,
      icon: Clock,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
    },
    {
      title: t("dashboard.inProgress"),
      value: bookingStats.inprogress,
      icon: TrendingUp,
      gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      title: t("dashboard.today"),
      value: bookingStats.today,
      icon: Calendar,
      gradient: "bg-gradient-to-br from-red-500 to-orange-500",
    },
    {
      title: t("dashboard.upcoming"),
      value: bookingStats.upcoming,
      icon: CalendarClock,
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
  ];

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/[_-]/g, "");
    switch (normalizedStatus) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "inprogress":
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "today":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "upcoming":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusTranslationKey = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/[_-]/g, "");
    return `dashboard.${normalizedStatus}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("dashboard.welcome")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Bookings */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl font-bold">
              {t("dashboard.latestBookings")}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              onClick={() => router.push("/dashboard/bookings")}
            >
              {t("dashboard.viewAll")}
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t("common.loading")}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                {error}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No bookings found
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {booking.customerName || 
                         booking.aircon?.customer?.name || 
                         booking.customer?.name || 
                         "Unknown Customer"}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {booking.serviceTypeName || 
                         booking.serviceType?.name || 
                         (booking.bookingServices && booking.bookingServices.length > 0 
                           ? booking.bookingServices.map(bs => bs.service?.name).filter(Boolean).join(", ")
                           : "Unknown Service")}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatDate(booking.bookingForDate || booking.scheduledDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {t(getStatusTranslationKey(booking.status), { defaultValue: booking.status })}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Forum Posts */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl font-bold">
              {t("dashboard.latestPosts")}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              onClick={() => router.push("/dashboard/forum")}
            >
              {t("dashboard.viewAll")}
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t("common.loading")}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                {error}
              </div>
            ) : forumPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No forum posts found
              </div>
            ) : (
              <div className="space-y-4">
                {forumPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {post.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        by {post.author || post.user?.name || "Unknown Author"}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {post.category && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                            {post.category}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {post.commentCount || 0} {t("dashboard.replies")}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setSelectedPostId(post.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={() => {
            setSelectedBooking(null);
            fetchDashboardData();
          }}
        />
      )}

      {selectedPostId && (
        <ForumPostModal
          postId={selectedPostId}
          onClose={() => {
            setSelectedPostId(null);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}

