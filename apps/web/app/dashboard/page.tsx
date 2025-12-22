"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  MessageSquare,
  X,
  Edit,
  Trash2,
  Save,
  Image as ImageIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { Booking, ForumPost, DashboardStats } from "@/types";
import Image from "next/image";

const DashboardPage = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    pendingBookings: 0,
    inProgressBookings: 0,
    todayBookings: 0,
    upcomingBookings: 0,
  });
  const [latestBookings, setLatestBookings] = useState<Booking[]>([]);
  const [latestPosts, setLatestPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [editingBooking, setEditingBooking] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [bookingFormData, setBookingFormData] = useState<Partial<Booking>>({});
  const [postFormData, setPostFormData] = useState<Partial<ForumPost>>({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch bookings
      const bookingsResponse = await api.get("/bookings");
      
      // API returns paginated data: {data: [...], pagination: {...}}
      const bookings = Array.isArray(bookingsResponse.data) 
        ? bookingsResponse.data 
        : bookingsResponse.data?.data || [];

      // Calculate stats
      const today = new Date().toISOString().split("T")[0];
      const pending = bookings.filter((b: Booking) => b.status === "pending").length;
      const inProgress = bookings.filter((b: Booking) => b.status === "in_progress" || b.status === "inprogress").length;
      const todayCount = bookings.filter(
        (b: Booking) => b.bookingForDate?.split("T")[0] === today
      ).length;
      const upcoming = bookings.filter(
        (b: Booking) =>
          new Date(b.bookingForDate) > new Date() && b.status !== "cancelled" && b.status !== "unsuccessful"
      ).length;

      setStats({
        pendingBookings: pending,
        inProgressBookings: inProgress,
        todayBookings: todayCount,
        upcomingBookings: upcoming,
      });

      // Get latest 5 bookings
      const sortedBookings = [...bookings]
        .sort((a: Booking, b: Booking) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5);
      setLatestBookings(sortedBookings);

      // Fetch forum posts (if endpoint exists)
      try {
        const postsResponse = await api.get("/forum/posts");
        
        // API returns paginated data: {data: [...], pagination: {...}}
        const posts = Array.isArray(postsResponse.data)
          ? postsResponse.data
          : postsResponse.data?.data || [];
          
        const sortedPosts = [...posts]
          .sort((a: ForumPost, b: ForumPost) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);
        setLatestPosts(sortedPosts);
      } catch (err) {
        console.log("Forum posts endpoint not available:", err);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      await api.patch(`/bookings/${selectedBooking.id}`, bookingFormData);
      await fetchDashboardData();
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
      await fetchDashboardData();
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    }
  };

  const handleUpdatePost = async () => {
    if (!selectedPost) return;
    
    try {
      await api.patch(`/forum/posts/${selectedPost.id}`, postFormData);
      await fetchDashboardData();
      setEditingPost(false);
      setSelectedPost(null);
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post");
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await api.delete(`/forum/posts/${selectedPost.id}`);
      await fetchDashboardData();
      setSelectedPost(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
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

  const openPostModal = (post: ForumPost) => {
    setSelectedPost(post);
    setPostFormData({
      title: post.title,
      content: post.content,
    });
    setEditingPost(false);
  };

  const statsCards = [
    {
      title: t("pendingBookings"),
      value: stats.pendingBookings,
      icon: AlertCircle,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      title: t("inProgressBookings"),
      value: stats.inProgressBookings,
      icon: Clock,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: t("todayBookings"),
      value: stats.todayBookings,
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: t("upcomingBookings"),
      value: stats.upcomingBookings,
      icon: CheckCircle2,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <h3 className="text-3xl font-bold mt-2">{card.value}</h3>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}
                  >
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Latest Bookings and Forum Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("latestBookings")}</CardTitle>
            <Button variant="ghost" size="sm">
              {t("viewAll")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestBookings.length > 0 ? (
                latestBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => openBookingModal(booking)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {booking.aircon?.customer?.name || "Customer"}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {t(booking.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {booking.bookingServices?.map((s: any) => s.service?.name).join(", ") || "Service"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(booking.bookingForDate)}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No bookings yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Latest Forum Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("latestForumPosts")}</CardTitle>
            <Button variant="ghost" size="sm">
              {t("viewAll")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestPosts.length > 0 ? (
                latestPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => openPostModal(post)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{post.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {post.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No forum posts yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
              <CardTitle className="text-2xl">Booking Details</CardTitle>
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
                ) : (
                  <>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={handleUpdateBooking}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingBooking(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
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
                <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">
                      {selectedBooking.aircon?.customer?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">
                      {selectedBooking.aircon?.customer?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">
                      {selectedBooking.aircon?.customer?.phoneNo || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Product</Label>
                    <p className="font-medium">
                      {selectedBooking.aircon?.product?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <Label className="text-muted-foreground">Requested Services</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedBooking.bookingServices?.map((s: any) => (
                    <span
                      key={s.service.id}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {s.service?.name} - ₱{s.service?.serviceFee}
                    </span>
                  )) || <p>No services</p>}
                </div>
              </div>

              {/* Technician Information */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Assigned Technician</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">
                      {selectedBooking.technician?.name || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">
                      {selectedBooking.technician?.phoneNo || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  {editingBooking ? (
                    <select
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      value={bookingFormData.status || selectedBooking.status}
                      onChange={(e) =>
                        setBookingFormData({ ...bookingFormData, status: e.target.value as any })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="inprogress">In Progress</option>
                      <option value="done">Done</option>
                      <option value="unsuccessful">Unsuccessful</option>
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
                  <Label className="text-muted-foreground">Scheduled Date</Label>
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
                  <Label className="text-muted-foreground">Booking Time</Label>
                  <p className="font-medium mt-1">{selectedBooking.bookingTime || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="font-medium mt-1">{selectedBooking.duration} minutes</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fees</Label>
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
                    <p className="font-medium mt-1">₱{selectedBooking.fees || "0.00"}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-muted-foreground">Description</Label>
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
                    {selectedBooking.description || "No description provided"}
                  </p>
                )}
              </div>

              {/* Photos */}
              {selectedBooking.bookingImages && selectedBooking.bookingImages.length > 0 && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Photos ({selectedBooking.bookingImages.length})
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
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="text-sm">{formatDate(selectedBooking.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Updated</Label>
                  <p className="text-sm">{formatDate(selectedBooking.updatedAt)}</p>
                </div>
              </div>

              {!editingBooking && (
                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedBooking(null);
                    setEditingBooking(false);
                  }}
                >
                  Close
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Forum Post Detail Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedPost(null);
            setEditingPost(false);
          }}
        >
          <Card
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-2xl flex-1">
                {editingPost ? (
                  <Input
                    value={postFormData.title || selectedPost.title}
                    onChange={(e) =>
                      setPostFormData({ ...postFormData, title: e.target.value })
                    }
                    className="text-2xl font-bold"
                    placeholder="Post title"
                  />
                ) : (
                  selectedPost.title
                )}
              </CardTitle>
              <div className="flex gap-2">
                {!editingPost ? (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingPost(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={handleDeletePost}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={handleUpdatePost}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingPost(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedPost(null);
                    setEditingPost(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Author Information */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <Label className="text-muted-foreground">Posted by</Label>
                  <p className="font-medium text-lg">
                    {selectedPost.author?.name || "Anonymous"}
                  </p>
                  {selectedPost.author?.email && (
                    <p className="text-sm text-muted-foreground">
                      {selectedPost.author.email}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <Label className="text-muted-foreground">Posted on</Label>
                  <p className="text-sm">{formatDate(selectedPost.createdAt)}</p>
                  {selectedPost.updatedAt !== selectedPost.createdAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated: {formatDate(selectedPost.updatedAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <Label className="text-muted-foreground">Content</Label>
                {editingPost ? (
                  <Textarea
                    value={postFormData.content || selectedPost.content}
                    onChange={(e) =>
                      setPostFormData({ ...postFormData, content: e.target.value })
                    }
                    className="mt-2"
                    rows={10}
                    placeholder="Post content"
                  />
                ) : (
                  <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                  </div>
                )}
              </div>

              {/* Photos (if they exist in the extended type) */}
              {(selectedPost as any).images && (selectedPost as any).images.length > 0 && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Photos ({(selectedPost as any).images.length})
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {(selectedPost as any).images.map((img: any, idx: number) => (
                      <div
                        key={idx}
                        className="relative aspect-video rounded-lg overflow-hidden border bg-muted"
                      >
                        <Image
                          src={img.url || img}
                          alt={`Post image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {(selectedPost as any).comments && (selectedPost as any).comments.length > 0 && (
                <div className="border-t pt-6">
                  <Label className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5" />
                    Comments ({(selectedPost as any).comments.length})
                  </Label>
                  <div className="space-y-4">
                    {(selectedPost as any).comments.map((comment: any, idx: number) => (
                      <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {comment.author?.name?.[0] || "?"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm">
                                {comment.author?.name || "Anonymous"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {comment.createdAt ? formatDate(comment.createdAt) : "Recently"}
                              </p>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!editingPost && (
                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedPost(null);
                    setEditingPost(false);
                  }}
                >
                  Close
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
