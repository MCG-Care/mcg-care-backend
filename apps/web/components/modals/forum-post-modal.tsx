"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, Send, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

const API_BASE_URL = "https://mcg-care-backend.onrender.com";

interface ForumPostModalProps {
  postId: number;
  onClose: () => void;
}

export function ForumPostModal({ postId, onClose }: ForumPostModalProps) {
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPostDetails();
    fetchComments();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Post details:", data);
        setPost(data);
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/forum/comments?postId=${postId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Comments:", data);
        setComments(data.data || data || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      alert("Please login to comment");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/forum/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: postId,
          content: newComment,
        }),
      });

      if (response.ok) {
        setNewComment("");
        fetchComments();
        fetchPostDetails(); // Refresh to update comment count
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      alert("Please login to delete comments");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/forum/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        fetchComments();
        fetchPostDetails();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (!post) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl m-4">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-2xl">Forum Post</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Post Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">
                {post.user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {post.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span className="font-medium">{post.user?.name || "Unknown"}</span>
                <span>•</span>
                <span className="capitalize">{post.user?.role || "user"}</span>
                <span>•</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {post.images.map((img: any, index: number) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                >
                  <Image
                    src={img.url}
                    alt={`Post image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="h-5 w-5 text-gray-500" />
              <h4 className="text-lg font-semibold">
                Comments ({comments.length})
              </h4>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  disabled={submitting}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-gray-500 py-4">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {comment.user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {comment.user?.name || "Unknown"}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500 text-xs">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
