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
  MessageSquare,
  Heart,
  MessageCircle,
  X,
  Edit,
  Trash2,
  Save,
  Image as ImageIcon,
  Send,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { ForumPost } from "@/types";
import Image from "next/image";

type SortBy = "postedDate" | "likes" | null;
type SortOrder = "asc" | "desc";
type DateRangeType = "single" | "range";

const ForumPage = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter states
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>("single");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  
  // Sort states - default to newest first (by createdAt)
  const [sortBy, setSortBy] = useState<SortBy>("postedDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Modal states
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [editingPost, setEditingPost] = useState(false);
  const [postFormData, setPostFormData] = useState<Partial<ForumPost>>({});
  const [newComment, setNewComment] = useState("");
  const [postLiked, setPostLiked] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPosts();
  }, [currentPage, pageSize, searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params: Record<string, any> = {
        page: currentPage,
        limit: pageSize,
      };
      
      // Add search if provided
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await api.get("/forum/posts", { params });
      
      // Handle paginated response
      const postsData = response.data?.data || [];
      const pagination = response.data?.pagination || {};
      
      setPosts(postsData);
      setTotalPosts(pagination.total || 0);
      setTotalPages(pagination.totalPages || 0);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      setPosts([]);
      setTotalPosts(0);
      setTotalPages(0);
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

  const openPostModal = async (post: ForumPost) => {
    try {
      // Fetch full post details with comments
      const response = await api.get(`/forum/posts/${post.id}`);
      setSelectedPost(response.data);
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
    } catch (error) {
      console.error("Error fetching post details:", error);
      // Fallback to basic post data
      setSelectedPost(post);
      setPostFormData({
        title: post.title,
        content: post.content,
      });
      setEditingPost(false);
      setNewComment("");
      setPostLiked(false);
      setCommentLikes({});
    }
  };

  const handleUpdatePost = async () => {
    if (!selectedPost) return;
    
    try {
      await api.patch(`/forum/posts/${selectedPost.id}`, postFormData);
      setCurrentPage(1); // Reset to first page after update
      await fetchPosts();
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
      // If we're on a page that might become empty, go back a page
      if (posts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      await fetchPosts();
      setSelectedPost(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  const handleLikePost = async () => {
    if (!selectedPost) return;
    
    try {
      const response = await api.post(`/forum/posts/${selectedPost.id}/like`);
      setPostLiked(response.data.liked);
      // Update the post's like count
      setSelectedPost({
        ...selectedPost,
        likeCount: response.data.likeCount,
      });
      // Also update in the posts list
      setPosts(posts.map(p => 
        p.id === selectedPost.id 
          ? { ...p, likeCount: response.data.likeCount }
          : p
      ));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleAddComment = async () => {
    if (!selectedPost || !newComment.trim()) return;
    
    try {
      await api.post("/forum/comments", {
        postId: selectedPost.id,
        content: newComment,
      });
      
      // Refresh post details to get new comment
      const response = await api.get(`/forum/posts/${selectedPost.id}`);
      setSelectedPost(response.data);
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
      alert("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedPost) return;
    
    if (!confirm("Are you sure you want to delete this comment?")) return;
    
    try {
      await api.delete(`/forum/comments/${commentId}`);
      
      // Refresh post details
      const response = await api.get(`/forum/posts/${selectedPost.id}`);
      setSelectedPost(response.data);
      
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
      alert("Failed to delete comment");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!selectedPost) return;
    
    try {
      const response = await api.post(`/forum/comments/${commentId}/like`);
      
      // Update comment likes state
      setCommentLikes({
        ...commentLikes,
        [commentId]: response.data.liked,
      });
      
      // Update the comment's like count in the selected post
      setSelectedPost({
        ...selectedPost,
        comments: selectedPost.comments?.map((comment) =>
          comment.id === commentId
            ? { ...comment, likeCount: response.data.likeCount }
            : comment
        ),
      });
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const clearFilters = () => {
    setDateRangeType("single");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const clearSort = () => {
    setSortBy("postedDate"); // Reset to default: newest first
    setSortOrder("desc");
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Filter and sort posts (client-side for date ranges and sorting)
  // Search is handled server-side via API
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // Search is now handled server-side, no need to filter here

    // Date filter (posted date)
    if (dateRangeType === "single" && dateFrom) {
      result = result.filter((post) => {
        const postDate = new Date(post.createdAt).toISOString().split("T")[0];
        return postDate === dateFrom;
      });
    } else if (dateRangeType === "range" && dateFrom && dateTo) {
      result = result.filter((post) => {
        const postDate = new Date(post.createdAt).toISOString().split("T")[0];
        return postDate >= dateFrom && postDate <= dateTo;
      });
    }

    // Sorting - always sort (default to newest first by createdAt)
    result.sort((a, b) => {
      let aValue: number | Date;
      let bValue: number | Date;

      if (sortBy === "postedDate") {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else if (sortBy === "likes") {
        aValue = a.likeCount || 0;
        bValue = b.likeCount || 0;
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
  }, [posts, searchQuery, dateRangeType, dateFrom, dateTo, sortBy, sortOrder]);

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
        <h1 className="text-m font-bold">{t("forumPosts")}</h1>
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
              {t("forumSearchHint")}
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("search") + "..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  setCurrentPage(1); // Reset to first page when changing date type
                }}
              >
                <option value="single">{t("singleDate")}</option>
                <option value="range">{t("dateRange")}</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {dateRangeType === "single" ? t("postedOnDate") : t("fromDate")}
              </Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1); // Reset to first page when changing date filter
                }}
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
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1); // Reset to first page when changing date filter
                  }}
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
              variant={sortBy === "postedDate" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("postedDate")}
              className="gap-2"
            >
              {getSortIcon("postedDate")}
              {t("postedOnDate")}
            </Button>
            <Button
              variant={sortBy === "likes" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("likes")}
              className="gap-2"
            >
              {getSortIcon("likes")}
              {t("numberOfLikes")}
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
              {(dateFrom || dateTo) && (
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

      {/* Pagination Info */}
      {!loading && totalPosts > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalPosts)} of {totalPosts} posts
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

      {/* Forum Posts List */}
      {filteredAndSortedPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            {filteredAndSortedPosts.map((post) => (
            <Card
              key={post.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openPostModal(post)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-bold">
                      {post.user?.name?.[0]?.toUpperCase() || "A"}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-medium">
                        {post.user?.name || "Anonymous"}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRoleColors(post.user?.role || "customer")}`}>
                        {post.user?.role || "Customer"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {formatDate(post.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{post.likeCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.commentCount || 0}</span>
                      </div>
                      {post.images && post.images.length > 0 && (
                        <span className="text-xs">
                          📷 {post.images.length} {t("photoCount")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>

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
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {loading
                ? t("loading") || "Loading..."
                : searchQuery || dateFrom || dateTo
                ? t("noPostsFoundMatchingFilters")
                : t("noPostsYet")}
            </p>
          </CardContent>
        </Card>
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
            className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b flex-shrink-0">
              <CardTitle className="text-2xl flex-1">
                {editingPost ? (
                  <Input
                    value={postFormData.title || selectedPost.title}
                    onChange={(e) =>
                      setPostFormData({ ...postFormData, title: e.target.value })
                    }
                    className="text-2xl font-bold"
                    placeholder={t("postTitle")}
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
                ) : null}
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
            <CardContent className="space-y-6 pt-6 overflow-y-auto flex-1 pb-4">
              {/* Author Information */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-lg font-bold">
                    {selectedPost.user?.name?.[0]?.toUpperCase() || "A"}
                  </span>
                </div>
                <div className="flex-1">
                  <Label className="text-muted-foreground">{t("postedBy")}</Label>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-lg">
                      {selectedPost.user?.name || t("anonymous")}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getRoleColors(selectedPost.user?.role || "customer")}`}>
                      {selectedPost.user?.role || t("customer")}
                    </span>
                  </div>
                  {selectedPost.user?.email && (
                    <p className="text-sm text-muted-foreground">
                      {selectedPost.user.email}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <Label className="text-muted-foreground">{t("postedOn")}</Label>
                  <p className="text-sm">{formatDate(selectedPost.createdAt)}</p>
                  {selectedPost.updatedAt !== selectedPost.createdAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("updated")}: {formatDate(selectedPost.updatedAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <Label className="text-muted-foreground">{t("content")}</Label>
                {editingPost ? (
                  <Textarea
                    value={postFormData.content || selectedPost.content}
                    onChange={(e) =>
                      setPostFormData({ ...postFormData, content: e.target.value })
                    }
                    className="mt-2"
                    rows={10}
                    placeholder={t("postContent")}
                  />
                ) : (
                  <div className="mt-2 p-4 bg-muted/30 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedPost.content}</p>
                  </div>
                )}
              </div>

              {/* Photos */}
              {selectedPost.images && selectedPost.images.length > 0 && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {t("photos")} ({selectedPost.images.length})
                  </Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {selectedPost.images.map((img, idx) => (
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
                    {postLiked ? t("liked") : t("like")} ({selectedPost.likeCount || 0})
                  </Button>
                </div>
              )}

              {/* Comments Section */}
              <div className="border-t pt-6">
                <Label className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5" />
                  {t("comments")} ({selectedPost.comments?.length || 0})
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
                {selectedPost.comments && selectedPost.comments.length > 0 ? (
                  <div className="space-y-4">
                    {selectedPost.comments.map((comment) => (
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
                                  {comment.user?.role || t("customer")}
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
                    {t("noCommentsYetBeFirst")}
                  </p>
                )}
              </div>
            </CardContent>
            {/* Sticky Action Buttons */}
            {editingPost ? (
              <div className="flex gap-2 p-4 border-t bg-background sticky bottom-0 flex-shrink-0">
                <Button
                  variant="default"
                  onClick={handleUpdatePost}
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
              <div className="p-4 border-t bg-background sticky bottom-0 flex-shrink-0">
                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedPost(null);
                    setEditingPost(false);
                  }}
                >
                  {t("close")}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default ForumPage;
