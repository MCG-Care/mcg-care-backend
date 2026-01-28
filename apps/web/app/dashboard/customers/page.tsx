"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Search,
  X,
  User as UserIcon,
  Package,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Send,
  Image as ImageIcon,
  Edit,
  Trash2,
  Save,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { User, CustomerProduct, ForumPost, Booking } from "@/types";
import Image from "next/image";

const CustomersPage = () => {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [customerProducts, setCustomerProducts] = useState<CustomerProduct[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showPostsModal, setShowPostsModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CustomerProduct | null>(null);
  const [productBookings, setProductBookings] = useState<Booking[]>([]);
  const [selectedPostDetail, setSelectedPostDetail] = useState<ForumPost | null>(null);
  const [postLiked, setPostLiked] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState("");
  const [editingPost, setEditingPost] = useState(false);
  const [postFormData, setPostFormData] = useState<Partial<ForumPost>>({});
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<Booking | null>(null);
  const [showBookingDetailModal, setShowBookingDetailModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      // Filter only customers
      const customersData = Array.isArray(response.data)
        ? response.data.filter((user: User) => user.role === "customer")
        : [];
      setCustomers(customersData);
    } catch (error) {
      console.error("Error fetching customers:", error);
      alert(t("failedToFetchCustomers"));
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerProducts = async (customerId: string) => {
    try {
      setLoadingProducts(true);
      // Use a large limit to get all products
      const response = await api.get(`/customer-products?customerId=${customerId}&limit=1000`);
      const productsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setCustomerProducts(productsData);
      setShowProductsModal(true);
    } catch (error) {
      console.error("Error fetching customer products:", error);
      alert(t("failedToFetchCustomerProducts"));
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCustomerPosts = async (customerId: string) => {
    try {
      setLoadingPosts(true);
      // Use a large limit to get all posts
      const response = await api.get(`/forum/posts?userId=${customerId}&limit=1000`);
      const postsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setForumPosts(postsData);
      setShowPostsModal(true);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      alert(t("failedToFetchForumPosts"));
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchProductBookings = async (airconId: string, product: CustomerProduct) => {
    try {
      setLoadingBookings(true);
      setSelectedProduct(product);
      // Fetch bookings for this specific aircon (customer product)
      const response = await api.get(`/bookings?airconId=${airconId}&limit=1000`);
      const bookingsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setProductBookings(bookingsData);
      setShowBookingsModal(true);
    } catch (error) {
      console.error("Error fetching product bookings:", error);
      alert(t("failedToFetchBookings"));
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleCustomerClick = async (customer: User) => {
    setSelectedCustomer(customer);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleColors = (role: string) => {
    const roleLower = role?.toLowerCase() || "customer";
    switch (roleLower) {
      case "admin":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
      case "technician":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
      case "customer":
      default:
        return "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20";
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

  const openBookingDetailModal = async (booking: Booking) => {
    try {
      // Fetch full booking details
      const response = await api.get(`/bookings/${booking.id}`);
      setSelectedBookingDetail(response.data);
      setShowBookingDetailModal(true);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      // Fallback to basic booking data
      setSelectedBookingDetail(booking);
      setShowBookingDetailModal(true);
    }
  };

  const openPostDetailModal = async (post: ForumPost) => {
    try {
      // Fetch full post details with comments
      const response = await api.get(`/forum/posts/${post.id}`);
      setSelectedPostDetail(response.data);
      setPostFormData({
        title: response.data.title,
        content: response.data.content,
      });
      setEditingPost(false);
      setNewComment("");
      
      // Check if user has liked the post
      try {
        const likeResponse = await api.get(`/forum/posts/${post.id}/liked`);
        setPostLiked(likeResponse.data.hasLiked);
      } catch (err) {
        setPostLiked(false);
      }

      // Check if user has liked each comment
      const likesMap: Record<string, boolean> = {};
      if (response.data.comments && response.data.comments.length > 0) {
        await Promise.all(
          response.data.comments.map(async (comment: any) => {
            try {
              const commentLikeResponse = await api.get(`/forum/comments/${comment.id}/liked`);
              likesMap[comment.id] = commentLikeResponse.data.hasLiked;
            } catch (err) {
              likesMap[comment.id] = false;
            }
          })
        );
      }
      setCommentLikes(likesMap);
      setShowPostDetailModal(true);
    } catch (error) {
      console.error("Error fetching post details:", error);
      // Fallback to basic post data
      setSelectedPostDetail(post);
      setPostFormData({
        title: post.title,
        content: post.content,
      });
      setEditingPost(false);
      setNewComment("");
      setPostLiked(false);
      setCommentLikes({});
      setShowPostDetailModal(true);
    }
  };

  const handleLikePost = async () => {
    if (!selectedPostDetail) return;
    
    try {
      const response = await api.post(`/forum/posts/${selectedPostDetail.id}/like`);
      setPostLiked(response.data.liked);
      // Update the post's like count
      setSelectedPostDetail({
        ...selectedPostDetail,
        likeCount: response.data.likeCount,
      });
      // Also update in the posts list
      setForumPosts(forumPosts.map(p => 
        p.id === selectedPostDetail.id 
          ? { ...p, likeCount: response.data.likeCount }
          : p
      ));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedPostDetail || !newComment.trim()) return;
    
    try {
      await api.post("/forum/comments", {
        postId: selectedPostDetail.id,
        content: newComment,
      });
      
      // Refresh post details to get new comment
      const response = await api.get(`/forum/posts/${selectedPostDetail.id}`);
      setSelectedPostDetail(response.data);
      setNewComment("");
      
      // Update comment likes map for new comment
      const likesMap: Record<string, boolean> = { ...commentLikes };
      if (response.data.comments && response.data.comments.length > 0) {
        const newComment = response.data.comments.find(
          (c: any) => !commentLikes[c.id] && c.id !== undefined
        );
        if (newComment) {
          try {
            const commentLikeResponse = await api.get(`/forum/comments/${newComment.id}/liked`);
            likesMap[newComment.id] = commentLikeResponse.data.hasLiked;
          } catch (err) {
            likesMap[newComment.id] = false;
          }
        }
      }
      setCommentLikes(likesMap);
    } catch (error) {
      console.error("Error adding comment:", error);
      alert(t("failedToAddComment"));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedPostDetail) return;
    
    if (!confirm(t("areYouSureDeleteComment"))) return;
    
    try {
      await api.delete(`/forum/comments/${commentId}`);
      
      // Refresh post details
      const response = await api.get(`/forum/posts/${selectedPostDetail.id}`);
      setSelectedPostDetail(response.data);
      
      // Update comment likes map
      const likesMap: Record<string, boolean> = {};
      if (response.data.comments && response.data.comments.length > 0) {
        await Promise.all(
          response.data.comments.map(async (comment: any) => {
            try {
              const commentLikeResponse = await api.get(`/forum/comments/${comment.id}/liked`);
              likesMap[comment.id] = commentLikeResponse.data.hasLiked;
            } catch (err) {
              likesMap[comment.id] = false;
            }
          })
        );
      }
      setCommentLikes(likesMap);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(t("failedToDeleteComment"));
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!selectedPostDetail) return;
    
    try {
      const response = await api.post(`/forum/comments/${commentId}/like`);
      
      // Update comment likes state
      setCommentLikes({
        ...commentLikes,
        [commentId]: response.data.liked,
      });
      
      // Update the comment's like count in the selected post
      setSelectedPostDetail({
        ...selectedPostDetail,
        comments: selectedPostDetail.comments?.map((comment) =>
          comment.id === commentId
            ? { ...comment, likeCount: response.data.likeCount }
            : comment
        ),
      });
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phoneNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Client-side pagination
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

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
        <h1 className="text-m font-bold">{t("manageCustomers")}</h1>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchCustomers")}
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
      {!loading && filteredCustomers.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredCustomers.length)} of {filteredCustomers.length} customers
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

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCustomers.map((customer) => (
          <Card
            key={customer.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleCustomerClick(customer)}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 gap-2">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <CardTitle className="text-lg truncate w-full">{customer.name}</CardTitle>
                  <p className="text-sm text-muted-foreground truncate w-full">
                    {customer.email}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {customer.phoneNo && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{customer.phoneNo}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">
                      {customer.address.city}, {customer.address.district}
                    </span>
                  </div>
                )}
                {customer.createdAt && (
                  <div className="text-xs text-muted-foreground pt-2">
                    {t("joined")} {formatDate(customer.createdAt)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {searchQuery
                ? t("noCustomersFound")
                : t("noCustomersAvailable")}
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

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedCustomer(null);
            setShowProductsModal(false);
            setShowPostsModal(false);
          }}
        >
          <Card
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-2xl">{t("customerDetails")}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedCustomer(null);
                  setShowProductsModal(false);
                  setShowPostsModal(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t("email")}
                    </Label>
                    <p className="font-medium mt-1">{selectedCustomer.email}</p>
                  </div>
                  {selectedCustomer.phoneNo && (
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {t("phone")}
                      </Label>
                      <p className="font-medium mt-1">{selectedCustomer.phoneNo}</p>
                    </div>
                  )}
                  {selectedCustomer.address && (
                    <>
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {t("address")}
                        </Label>
                        <p className="font-medium mt-1">{selectedCustomer.address.address}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">{t("location")}</Label>
                        <p className="font-medium mt-1">
                          {selectedCustomer.address.township}, {selectedCustomer.address.city}, {selectedCustomer.address.district}
                        </p>
                      </div>
                    </>
                  )}
                  {selectedCustomer.createdAt && (
                    <div>
                      <Label className="text-muted-foreground">{t("memberSince")}</Label>
                      <p className="font-medium mt-1">{formatDate(selectedCustomer.createdAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => fetchCustomerProducts(selectedCustomer.id)}
                  disabled={loadingProducts}
                >
                  {loadingProducts ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4" />
                  )}
                  {t("viewProducts")}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => fetchCustomerPosts(selectedCustomer.id)}
                  disabled={loadingPosts}
                >
                  {loadingPosts ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                  {t("viewForumPosts")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customer Products Modal */}
      {showProductsModal && selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowProductsModal(false)}
        >
          <Card
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-2xl">
                {t("products")} - {selectedCustomer.name}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProductsModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {customerProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customerProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => fetchProductBookings(product.id, product)}
                    >
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">{product.name}</h4>
                        {product.product && (
                          <div className="text-sm text-muted-foreground">
                            <p>{t("product")}: {product.product.name}</p>
                            <p>{t("brand")}: {product.product.brand}</p>
                            <p>{t("productModel")}: {product.product.productModel}</p>
                          </div>
                        )}
                        {product.purchaseDate && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">{t("purchased")}: </span>
                            {formatDate(product.purchaseDate)}
                          </p>
                        )}
                        {product.warrantyEndDate && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">{t("warrantyUntil")}: </span>
                            {formatDate(product.warrantyEndDate)}
                          </p>
                        )}
                        {product.purchaseCode && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">{t("purchaseCode")}: </span>
                            {product.purchaseCode}
                          </p>
                        )}
                        <div className="pt-2 text-xs text-primary font-medium">
                          {t("clickToViewBookings")}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  {t("noProductsFoundForCustomer")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Forum Posts Modal */}
      {showPostsModal && selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPostsModal(false)}
        >
          <Card
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-2xl">
                {t("forumPosts")} - {selectedCustomer.name}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPostsModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {forumPosts.length > 0 ? (
                <div className="space-y-4">
                  {forumPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => openPostDetailModal(post)}
                    >
                      <div className="space-y-3">
                        <h4 className="font-semibold text-lg">{post.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>❤️ {post.likeCount} likes</span>
                          {post.commentCount !== undefined && (
                            <span>💬 {post.commentCount} comments</span>
                          )}
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                        {post.images && post.images.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            📷 {post.images.length} image(s)
                          </div>
                        )}
                        <div className="pt-2 text-xs text-primary font-medium">
                          {t("clickToViewDetails")}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  {t("noForumPostsFoundForCustomer")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Product Bookings Modal */}
      {showBookingsModal && selectedProduct && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowBookingsModal(false);
            setSelectedProduct(null);
          }}
        >
          <Card
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-2xl">
                {t("bookings")} - {selectedProduct.name}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowBookingsModal(false);
                  setSelectedProduct(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingBookings ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : productBookings.length > 0 ? (
                <div className="space-y-4">
                  {productBookings.map((booking, index) => (
                    <Card 
                      key={booking.id} 
                      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => openBookingDetailModal(booking)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold">
                                {t("bookings")} #{index + 1}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(booking.bookingForDate)}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === "done"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                : booking.status === "inprogress" || booking.status === "in_progress"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                                : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <Label className="text-muted-foreground">{t("bookingTime")}</Label>
                            <p className="font-medium">{booking.bookingTime || "N/A"}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">{t("duration")}</Label>
                            <p className="font-medium">{booking.duration} {t("min")}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">{t("fees")}</Label>
                            <p className="font-medium">{booking.fees || "0.00"} Ks</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">{t("technician")}</Label>
                            <p className="font-medium">
                              {booking.technician?.name || t("notAssigned")}
                            </p>
                          </div>
                        </div>
                        {booking.description && (
                          <div>
                            <Label className="text-muted-foreground">{t("description")}</Label>
                            <p className="text-sm mt-1">{booking.description}</p>
                          </div>
                        )}
                        {booking.bookingServices && booking.bookingServices.length > 0 && (
                          <div>
                            <Label className="text-muted-foreground">{t("services")}</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {booking.bookingServices.map((service: any, index: number) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                                >
                                  {service.service?.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          {t("created")}: {formatDate(booking.createdAt)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">
                  {t("noBookingsFoundForProduct")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Booking Detail Modal */}
      {showBookingDetailModal && selectedBookingDetail && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowBookingDetailModal(false);
            setSelectedBookingDetail(null);
          }}
        >
          <Card
            className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b flex-shrink-0">
              <CardTitle className="text-2xl">{t("bookingDetails")}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowBookingDetailModal(false);
                  setSelectedBookingDetail(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 overflow-y-auto flex-1 pb-4">
              {/* Customer Information */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">{t("customerInformation")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t("name")}</Label>
                    <p className="font-medium">
                      {selectedBookingDetail.aircon?.customer?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("email")}</Label>
                    <p className="font-medium">
                      {selectedBookingDetail.aircon?.customer?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("phone")}</Label>
                    <p className="font-medium">
                      {selectedBookingDetail.aircon?.customer?.phoneNo || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("product")}</Label>
                    <p className="font-medium">
                      {selectedBookingDetail.aircon?.product?.name || "N/A"}
                    </p>
                  </div>
                  {selectedBookingDetail.aircon?.name && (
                    <div>
                      <Label className="text-muted-foreground">{t("productNickname")}</Label>
                      <p className="font-medium">
                        {selectedBookingDetail.aircon.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Services */}
              <div>
                <Label className="text-muted-foreground">{t("requestedServices")}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedBookingDetail.bookingServices?.map((s: any) => (
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
                      {selectedBookingDetail.technician?.name || t("notAssigned")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t("phone")}</Label>
                    <p className="font-medium">
                      {selectedBookingDetail.technician?.phoneNo || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Address */}
              {selectedBookingDetail.serviceAddress && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">{t("serviceAddress")}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedBookingDetail.serviceAddress.name && (
                      <div>
                        <Label className="text-muted-foreground">{t("name")}</Label>
                        <p className="font-medium">{selectedBookingDetail.serviceAddress.name}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">{t("address")}</Label>
                      <p className="font-medium">{selectedBookingDetail.serviceAddress.address}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t("township")}</Label>
                      <p className="font-medium">{selectedBookingDetail.serviceAddress.township}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t("city")}</Label>
                      <p className="font-medium">{selectedBookingDetail.serviceAddress.city}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t("district")}</Label>
                      <p className="font-medium">{selectedBookingDetail.serviceAddress.district}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t("status")}</Label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm mt-1 ${getStatusColor(
                      selectedBookingDetail.status
                    )}`}
                  >
                    {t(selectedBookingDetail.status)}
                  </span>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("scheduledDate")}</Label>
                  <p className="font-medium mt-1">
                    {formatDate(selectedBookingDetail.bookingForDate)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("bookingTime")}</Label>
                  <p className="font-medium mt-1">{selectedBookingDetail.bookingTime || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("duration")}</Label>
                  <p className="font-medium mt-1">{selectedBookingDetail.duration} {t("minutes")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("fees")}</Label>
                  <p className="font-medium mt-1">{selectedBookingDetail.fees || "0.00"} Ks</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-muted-foreground">{t("description")}</Label>
                <p className="mt-1 whitespace-pre-wrap">
                  {selectedBookingDetail.description || t("noDescriptionProvided")}
                </p>
              </div>

              {/* Photos */}
              {selectedBookingDetail.bookingImages && selectedBookingDetail.bookingImages.length > 0 && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {t("photos")} ({selectedBookingDetail.bookingImages.length})
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                    {selectedBookingDetail.bookingImages.map((img) => (
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
                  <p className="text-sm">{formatDate(selectedBookingDetail.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("lastUpdated")}</Label>
                  <p className="text-sm">{formatDate(selectedBookingDetail.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
            {/* Sticky Close Button */}
            <div className="p-4 border-t bg-background sticky bottom-0 flex-shrink-0">
              <Button
                className="w-full"
                onClick={() => {
                  setShowBookingDetailModal(false);
                  setSelectedBookingDetail(null);
                }}
              >
                {t("close")}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Forum Post Detail Modal */}
      {showPostDetailModal && selectedPostDetail && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowPostDetailModal(false);
            setSelectedPostDetail(null);
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
                    value={postFormData.title || selectedPostDetail.title}
                    onChange={(e) =>
                      setPostFormData({ ...postFormData, title: e.target.value })
                    }
                    className="text-2xl font-bold"
                    placeholder={t("postTitle")}
                  />
                ) : (
                  selectedPostDetail.title
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
                      onClick={async () => {
                        if (!selectedPostDetail) return;
                        if (!confirm(t("areYouSureDeletePost"))) return;
                        try {
                          await api.delete(`/forum/posts/${selectedPostDetail.id}`);
                          setForumPosts(forumPosts.filter(p => p.id !== selectedPostDetail.id));
                          setShowPostDetailModal(false);
                          setSelectedPostDetail(null);
                        } catch (error) {
                          console.error("Error deleting post:", error);
                          alert(t("failedToDeletePost"));
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowPostDetailModal(false);
                    setSelectedPostDetail(null);
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
                  <span className="text-white text-lg font-bold">
                    {selectedPostDetail.user?.name?.[0]?.toUpperCase() || "A"}
                  </span>
                </div>
                <div className="flex-1">
                  <Label className="text-muted-foreground">{t("postedBy")}</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-lg">
                      {selectedPostDetail.user?.name || t("anonymous")}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getRoleColors(selectedPostDetail.user?.role || "customer")}`}>
                      {selectedPostDetail.user?.role === "admin" ? t("admin") : selectedPostDetail.user?.role === "technician" ? t("technician") : t("customer")}
                    </span>
                  </div>
                  {selectedPostDetail.user?.email && (
                    <p className="text-sm text-muted-foreground">
                      {selectedPostDetail.user.email}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <Label className="text-muted-foreground">{t("postedOn")}</Label>
                  <p className="text-sm">{formatDate(selectedPostDetail.createdAt)}</p>
                  {selectedPostDetail.updatedAt !== selectedPostDetail.createdAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("updated")}: {formatDate(selectedPostDetail.updatedAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <Label className="text-muted-foreground">{t("content")}</Label>
                {editingPost ? (
                  <Textarea
                    value={postFormData.content || selectedPostDetail.content}
                    onChange={(e) =>
                      setPostFormData({ ...postFormData, content: e.target.value })
                    }
                    className="mt-2"
                    rows={10}
                    placeholder={t("content")}
                  />
                ) : (
                  <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedPostDetail.content}</p>
                  </div>
                )}
              </div>

              {/* Photos */}
              {selectedPostDetail.images && selectedPostDetail.images.length > 0 && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {t("photos")} ({selectedPostDetail.images.length})
                  </Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {selectedPostDetail.images.map((img, idx) => (
                      <div
                        key={img.id || idx}
                        className="relative aspect-video rounded-lg overflow-hidden border bg-muted"
                      >
                        <Image
                          src={img.url}
                          alt={`Post image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Like Button */}
              {!editingPost && (
                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button
                    variant={postLiked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLikePost}
                    className="gap-2"
                  >
                    <Heart className={`h-4 w-4 ${postLiked ? "fill-current" : ""}`} />
                    {postLiked ? t("liked") : t("like")} ({selectedPostDetail.likeCount || 0})
                  </Button>
                </div>
              )}

              {/* Comments Section */}
              <div className="border-t pt-6">
                <Label className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5" />
                  {t("comments")} ({selectedPostDetail.comments?.length || 0})
                </Label>

                {/* Add Comment Input */}
                {!editingPost && (
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder={t("writeAComment")}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      size="icon"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Comments List */}
                {selectedPostDetail.comments && selectedPostDetail.comments.length > 0 ? (
                  <div className="space-y-4">
                    {selectedPostDetail.comments.map((comment) => (
                      <div key={comment.id} className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {comment.user?.name?.[0]?.toUpperCase() || "A"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">
                                  {comment.user?.name || t("anonymous")}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRoleColors(comment.user?.role || "customer")}`}>
                                  {comment.user?.role === "admin" ? t("admin") : comment.user?.role === "technician" ? t("technician") : t("customer")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(comment.createdAt)}
                                </p>
                                {!editingPost && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleDeleteComment(comment.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-600" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm whitespace-pre-wrap mb-2">{comment.content}</p>
                            <div className="flex items-center gap-2">
                              <Button
                                variant={commentLikes[comment.id] ? "default" : "ghost"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLikeComment(comment.id);
                                }}
                                className="h-7 gap-1 text-xs"
                              >
                                <Heart className={`h-3 w-3 ${commentLikes[comment.id] ? "fill-current" : ""}`} />
                                {comment.likeCount || 0}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    {t("noCommentsYet")}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {editingPost ? (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="default"
                    onClick={async () => {
                      if (!selectedPostDetail) return;
                      try {
                        await api.patch(`/forum/posts/${selectedPostDetail.id}`, postFormData);
                        const response = await api.get(`/forum/posts/${selectedPostDetail.id}`);
                        setSelectedPostDetail(response.data);
                        setForumPosts(forumPosts.map(p => 
                          p.id === selectedPostDetail.id ? response.data : p
                        ));
                        setEditingPost(false);
                      } catch (error) {
                        console.error("Error updating post:", error);
                        alert(t("failedToUpdatePost"));
                      }
                    }}
                    className="flex-1 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {t("save")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingPost(false)}
                    className="flex-1"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => {
                    setShowPostDetailModal(false);
                    setSelectedPostDetail(null);
                    setEditingPost(false);
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

export default CustomersPage;
