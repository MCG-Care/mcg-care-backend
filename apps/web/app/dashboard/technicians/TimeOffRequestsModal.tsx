"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  X,
  Check,
  XCircle,
  Calendar,
  Clock,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  Ban,
  AlertTriangle,
  Search,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { TimeOffRequest } from "@/types";
import { formatHourTo12Hour } from "@/lib/utils";

type TabType = "pending" | "past";

interface TimeOffRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TimeOffRequestsModal: React.FC<TimeOffRequestsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    bookingId?: string;
    conflictDate?: string;
    bookingHours?: string;
    requestedHours?: string;
  }>({ isOpen: false });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Reset to pending tab and first page when modal opens
      setActiveTab("pending");
      setStatusFilter("all");
      setSearchQuery("");
      setCurrentPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage, pageSize, statusFilter, searchQuery, isOpen]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let allRequests: TimeOffRequest[] = [];
      
      if (activeTab === "pending") {
        // Fetch only pending requests
        const response = await api.get("/time-off-requests?status=pending");
        allRequests = Array.isArray(response.data) ? response.data : [];
      } else {
        // Fetch all requests and filter for approved/rejected
        const response = await api.get("/time-off-requests");
        const allData = Array.isArray(response.data) ? response.data : [];
        let filteredData = allData.filter(
          (req: TimeOffRequest) => req.status === "approved" || req.status === "rejected"
        );
        
        // Apply status filter if not "all"
        if (statusFilter !== "all") {
          filteredData = filteredData.filter(
            (req: TimeOffRequest) => req.status === statusFilter
          );
        }
        
        allRequests = filteredData;
      }
      
      // Sort by createdAt descending (newest first)
      allRequests.sort((a: TimeOffRequest, b: TimeOffRequest) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      // Apply search filter
      let filteredRequests = allRequests;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredRequests = allRequests.filter((req: TimeOffRequest) => {
          // Search in technician name
          const technicianName = req.technician?.name?.toLowerCase() || "";
          // Search in technician email
          const technicianEmail = req.technician?.email?.toLowerCase() || "";
          // Search in reason
          const reason = req.reason?.toLowerCase() || "";
          // Search in dates
          const startDate = req.startDate.toLowerCase();
          const endDate = req.endDate.toLowerCase();
          // Search in review note (for past requests)
          const reviewNote = req.reviewNote?.toLowerCase() || "";
          
          return (
            technicianName.includes(query) ||
            technicianEmail.includes(query) ||
            reason.includes(query) ||
            startDate.includes(query) ||
            endDate.includes(query) ||
            reviewNote.includes(query)
          );
        });
      }
      
      setTotalRequests(filteredRequests.length);
      
      // Client-side pagination
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredRequests.slice(startIndex, endIndex);
      
      setRequests(paginatedData);
    } catch (error: any) {
      console.error("Error fetching time off requests:", error);
      setError(
        error.response?.data?.message || t("failedToFetchTimeOffRequests")
      );
    } finally {
      setLoading(false);
    }
  };

  const parseConflictError = (message: string) => {
    // Parse error message format: "Cannot approve: Existing booking (ID: 123) on 2026-01-27 conflicts with requested time slots. Booking occupies hours 9, 10, 11, which overlaps with requested slots 9, 10, 11, 12."
    const bookingIdMatch = message.match(/booking \(ID: (\d+)\)/i);
    const dateMatch = message.match(/on (\d{4}-\d{2}-\d{2})/i);
    const bookingHoursMatch = message.match(/Booking occupies hours ([0-9,\s]+)/i);
    const requestedHoursMatch = message.match(/requested slots ([0-9,\s]+)/i);
    
    return {
      bookingId: bookingIdMatch ? bookingIdMatch[1] : undefined,
      conflictDate: dateMatch ? dateMatch[1] : undefined,
      bookingHours: bookingHoursMatch ? bookingHoursMatch[1].trim() : undefined,
      requestedHours: requestedHoursMatch ? requestedHoursMatch[1].trim() : undefined,
    };
  };

  const handleReview = async (requestId: string, status: "approved" | "rejected") => {
    try {
      setReviewingId(requestId);
      setError(null);
      setConflictModal({ isOpen: false });
      
      await api.patch(`/time-off-requests/${requestId}/review`, {
        status,
        reviewNote: reviewNote[requestId] || undefined,
      });

      // Refresh the requests list
      await fetchRequests();
      
      // Clear the review note for this request
      setReviewNote((prev) => {
        const updated = { ...prev };
        delete updated[requestId];
        return updated;
      });
    } catch (error: any) {
      console.error("Error reviewing request:", error);
      const errorMessage = error.response?.data?.message || t("failedToReviewTimeOffRequest");
      
      // Check if it's a booking conflict error
      if (errorMessage.toLowerCase().includes("cannot approve") && errorMessage.toLowerCase().includes("conflicts")) {
        const conflictInfo = parseConflictError(errorMessage);
        setConflictModal({
          isOpen: true,
          ...conflictInfo,
        });
      } else {
        setError(errorMessage);
      }
    } finally {
      setReviewingId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    if (tab === "past") {
      setStatusFilter("all");
    }
  };

  const handleStatusFilterChange = (status: "all" | "approved" | "rejected") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const totalPages = Math.ceil(totalRequests / pageSize);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatSlot = (slot: number) => {
    return formatHourTo12Hour(slot);
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (startDate === endDate) {
      return formatDate(startDate);
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const formatTimeRange = (startSlot: number, endSlot: number, isFullDay: boolean) => {
    if (isFullDay) {
      return t("fullDay");
    }
    return `${formatSlot(startSlot)} - ${formatSlot(endSlot)}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-4xl bg-background my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between border-b flex-shrink-0">
          <CardTitle>{t("timeOffRequests")}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6 overflow-y-auto flex-1">
          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6 border-b">
            <Button
              onClick={() => handleTabChange("pending")}
              variant={activeTab === "pending" ? "default" : "ghost"}
              className={`rounded-b-none ${
                activeTab === "pending"
                  ? "border-b-2 border-primary"
                  : "hover:bg-muted"
              }`}
            >
              {t("pending")}
            </Button>
            <Button
              onClick={() => handleTabChange("past")}
              variant={activeTab === "past" ? "default" : "ghost"}
              className={`rounded-b-none ${
                activeTab === "past"
                  ? "border-b-2 border-primary"
                  : "hover:bg-muted"
              }`}
            >
              {t("pastRequests")}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchTimeOffRequests")}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter - Only show for Past Requests tab */}
          {activeTab === "past" && (
            <div className="mb-4 flex items-center gap-2">
              <Label className="text-sm">{t("filterByStatus")}:</Label>
              <select
                className="px-3 py-1.5 border rounded-md bg-background text-sm"
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value as "all" | "approved" | "rejected")}
              >
                <option value="all">{t("allStatuses")}</option>
                <option value="approved">{t("approved")}</option>
                <option value="rejected">{t("rejected")}</option>
              </select>
            </div>
          )}

          {/* Pagination Info */}
          {!loading && totalRequests > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <div>
                {t("showing")} {((currentPage - 1) * pageSize) + 1} {t("to")} {Math.min(currentPage * pageSize, totalRequests)} {t("of")} {totalRequests} {t("requests")}
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">{t("itemsPerPage")}:</Label>
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
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    {/* Technician Info */}
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-lg">
                          {request.technician?.name || `Technician #${request.technicianId}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.technician?.email || ""}
                        </p>
                        {request.technician?.phoneNo && (
                          <p className="text-sm text-muted-foreground">
                            {request.technician.phoneNo}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                          <Label className="text-xs text-muted-foreground">{t("dateRange")}</Label>
                          <p className="font-medium text-sm">
                            {formatDateRange(request.startDate, request.endDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                          <Label className="text-xs text-muted-foreground">{t("timeRange")}</Label>
                          <p className="font-medium text-sm">
                            {formatTimeRange(request.startSlot, request.endSlot, request.isFullDay)}
                          </p>
                        </div>
                      </div>

                      {request.reason && (
                        <div className="flex items-start gap-2 md:col-span-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">{t("reason")}</Label>
                            <p className="font-medium text-sm">{request.reason}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2 md:col-span-2">
                        <Label className="text-xs text-muted-foreground">{t("requestedOn")}</Label>
                        <p className="font-medium text-sm">
                          {new Date(request.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                      </div>

                      {/* Show review info for past requests */}
                      {activeTab === "past" && (
                        <>
                          <div className="flex items-start gap-2 md:col-span-2">
                            <div className="flex items-center gap-2">
                              {request.status === "approved" ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <Ban className="h-4 w-4 text-red-600" />
                              )}
                              <div>
                                <Label className="text-xs text-muted-foreground">{t("status")}</Label>
                                <p className={`font-medium text-sm capitalize ${
                                  request.status === "approved" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {request.status === "approved" ? t("approved") : t("rejected")}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {request.reviewedAt && (
                            <div className="flex items-start gap-2 md:col-span-2">
                              <Label className="text-xs text-muted-foreground">{t("reviewedOn")}</Label>
                              <p className="font-medium text-sm">
                                {new Date(request.reviewedAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </p>
                            </div>
                          )}

                          {request.reviewer && (
                            <div className="flex items-start gap-2 md:col-span-2">
                              <Label className="text-xs text-muted-foreground">{t("reviewedBy")}</Label>
                              <p className="font-medium text-sm">
                                {request.reviewer.name} ({request.reviewer.email})
                              </p>
                            </div>
                          )}

                          {request.reviewNote && (
                            <div className="flex items-start gap-2 md:col-span-2">
                              <FileText className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <Label className="text-xs text-muted-foreground">{t("reviewNote")}</Label>
                                <p className="font-medium text-sm">{request.reviewNote}</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Review Note Input - Only for pending requests */}
                    {activeTab === "pending" && (
                      <div className="space-y-2">
                        <Label htmlFor={`note-${request.id}`} className="text-sm">
                          {t("reviewNoteOptional")}
                        </Label>
                        <Input
                          id={`note-${request.id}`}
                          placeholder={t("addNoteAboutDecision")}
                          value={reviewNote[request.id] || ""}
                          onChange={(e) =>
                            setReviewNote({
                              ...reviewNote,
                              [request.id]: e.target.value,
                            })
                          }
                          disabled={reviewingId === request.id}
                        />
                      </div>
                    )}

                    {/* Action Buttons - Only for pending requests */}
                    {activeTab === "pending" && (
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          className="flex-1 gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={() => handleReview(request.id, "approved")}
                          disabled={reviewingId === request.id}
                        >
                          {reviewingId === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          {t("approve")}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleReview(request.id, "rejected")}
                          disabled={reviewingId === request.id}
                        >
                          {reviewingId === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          {t("reject")}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {activeTab === "pending"
                  ? t("noPendingTimeOffRequests")
                  : t("noPastTimeOffRequests")}
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                {t("first")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                {t("previous")}
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
                {t("next")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                {t("last")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Conflict Modal */}
      {conflictModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setConflictModal({ isOpen: false })}
        >
          <Card
            className="w-full max-w-2xl bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-red-600 dark:text-red-400">
                  {t("bookingConflictError")}
                </CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setConflictModal({ isOpen: false })}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("bookingConflictMessage")}
              </p>

              <div className="space-y-3 p-4 bg-muted rounded-lg">
                {conflictModal.bookingId && (
                  <div className="flex items-start gap-3">
                    <Label className="text-sm font-semibold min-w-[140px]">
                      {t("bookingId")}:
                    </Label>
                    <p className="text-sm font-mono">{conflictModal.bookingId}</p>
                  </div>
                )}

                {conflictModal.conflictDate && (
                  <div className="flex items-start gap-3">
                    <Label className="text-sm font-semibold min-w-[140px]">
                      {t("conflictDate")}:
                    </Label>
                    <p className="text-sm">
                      {new Date(conflictModal.conflictDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {conflictModal.bookingHours && (
                  <div className="flex items-start gap-3">
                    <Label className="text-sm font-semibold min-w-[140px]">
                      {t("bookingOccupiesHours")}:
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {conflictModal.bookingHours.split(",").map((hour, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-xs font-medium"
                        >
                          {formatHourTo12Hour(parseInt(hour.trim(), 10))}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {conflictModal.requestedHours && (
                  <div className="flex items-start gap-3">
                    <Label className="text-sm font-semibold min-w-[140px]">
                      {t("requestedSlots")}:
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {conflictModal.requestedHours.split(",").map((hour, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                        >
                          {formatHourTo12Hour(parseInt(hour.trim(), 10))}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <Label className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                      {t("conflictResolution")}:
                    </Label>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      {t("conflictResolutionText")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setConflictModal({ isOpen: false })}>
                  {t("close")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TimeOffRequestsModal;
