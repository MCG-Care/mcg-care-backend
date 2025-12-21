"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Search, Eye, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ForumPostModal } from "@/components/modals/forum-post-modal";

const API_BASE_URL = "https://mcg-care-backend.onrender.com";

interface ForumPost {
  id: number;
  title: string;
  content: string;
  user?: {
    name?: string;
    role?: string;
  };
  commentCount?: number;
  likeCount?: number;
  createdAt?: string;
}

export default function ForumPage() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_BASE_URL}/forum/posts?page=${currentPage}&limit=10`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        console.log("Forum Posts Response:", data);
        setPosts(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
      } else {
        const errorText = await response.text();
        console.error("Forum Posts API Error:", response.status, errorText);
        setError(`Failed to load forum posts: ${response.status}`);
      }
    } catch (err) {
      console.error("Error fetching forum posts:", err);
      setError("Failed to load forum posts. Please check your connection.");
    } finally {
      setLoading(false);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("sidebar.forum")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Community discussions and posts
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search forum posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </form>

      {/* Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {t("common.loading")}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchPosts} variant="outline">
              Retry
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p>No forum posts found</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <Card
                key={post.id}
                className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                        <span>
                          by {post.user?.name || "Unknown"} ({post.user?.role || "user"})
                        </span>
                        <span>•</span>
                        <span>{formatDate(post.createdAt)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.commentCount || 0} {t("dashboard.replies")}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 flex-shrink-0"
                      onClick={() => setSelectedPostId(post.id)}
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
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
      </div>

      {/* Forum Post Modal */}
      {selectedPostId && (
        <ForumPostModal
          postId={selectedPostId}
          onClose={() => {
            setSelectedPostId(null);
            fetchPosts(); // Refresh to update comment counts
          }}
        />
      )}
    </div>
  );
}
