"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Search,
  X,
  AirVent,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Package,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { CustomerProduct, Booking } from "@/types";
import Image from "next/image";
import { formatCurrency, formatTimeTo12Hour } from "@/lib/utils";

/**
 * Extract serial number from QR URL.
 * Format: "cp-7-3-1770741203300-7a9933b644369422" -> "7a9933b644369422"
 */
function getSerialFromQrUrl(qrUrl: string | null | undefined): string {
  if (!qrUrl) return "—";
  const parts = qrUrl.split("-");
  return parts[parts.length - 1] || "—";
}

const CustomerProductsPage = () => {
  const { t } = useLanguage();
  const [customerProducts, setCustomerProducts] = useState<CustomerProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<CustomerProduct | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [productBookings, setProductBookings] = useState<Booking[]>([]);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBookingDetail, setSelectedBookingDetail] =
    useState<Booking | null>(null);
  const [showBookingDetailModal, setShowBookingDetailModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isInitialLoadRef = useRef(true);

  // Debounce search (500ms for slow typers)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCustomerProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: pageSize,
      };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      const response = await api.get("/customer-products", { params });
      const data = response.data?.data || [];
      const pagination = response.data?.pagination || {};
      setCustomerProducts(data);
      setTotalItems(pagination.total ?? 0);
      setTotalPages(pagination.totalPages ?? 0);
    } catch (error) {
      console.error("Error fetching customer products:", error);
      setCustomerProducts([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchCustomerProducts();
  }, [fetchCustomerProducts]);

  // Restore focus to search input after refresh completes (skip initial load)
  useEffect(() => {
    if (!loading && searchInputRef.current) {
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      } else {
        searchInputRef.current.focus();
      }
    }
  }, [loading]);

  const fetchProductDetail = async (id: string) => {
    try {
      setLoadingDetail(true);
      const response = await api.get(`/customer-products/${id}`);
      setSelectedProduct(response.data);
    } catch (error) {
      console.error("Error fetching product details:", error);
      setSelectedProduct(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchProductBookings = async () => {
    if (!selectedProduct) return;
    try {
      setLoadingBookings(true);
      const response = await api.get(
        `/bookings?airconId=${selectedProduct.id}&limit=1000`
      );
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

  const openBookingDetailModal = async (booking: Booking) => {
    try {
      const response = await api.get(`/bookings/${booking.id}`);
      setSelectedBookingDetail(response.data);
      setShowBookingDetailModal(true);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      setSelectedBookingDetail(booking);
      setShowBookingDetailModal(true);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  if (loading && customerProducts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("manageCustomerProducts")}</h1>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder={t("searchCustomerProducts")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pagination Info */}
      {!loading && customerProducts.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            {t("showing")} {((currentPage - 1) * pageSize) + 1} {t("to")}{" "}
            {Math.min(currentPage * pageSize, totalItems)} {t("of")}{" "}
            {totalItems} {t("customerProducts").toLowerCase()}
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

      {/* Customer Products List (compact) */}
      <div className="grid grid-cols-1 gap-4">
        {customerProducts.map((cp) => (
          <Card
            key={cp.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => fetchProductDetail(String(cp.id))}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AirVent className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base truncate">
                        {cp.name}
                      </h3>
                      <p className="text-sm text-muted-foreground font-mono truncate">
                        {t("serialNumber")}: {getSerialFromQrUrl(cp.qrUrl)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {cp.customer && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t("customer")}</p>
                        <p className="text-sm font-medium truncate">{cp.customer.name}</p>
                      </div>
                    )}
                    {cp.customer?.email && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t("email")}</p>
                        <p className="text-sm font-medium truncate">{cp.customer.email}</p>
                      </div>
                    )}
                    {cp.product && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t("product")}</p>
                        <p className="text-sm font-medium truncate">
                          {cp.product.name} · {cp.product.brand}
                        </p>
                      </div>
                    )}
                    {cp.purchaseDate && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t("purchased")}</p>
                        <p className="text-sm font-medium">{formatDate(cp.purchaseDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchProductDetail(String(cp.id));
                  }}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {customerProducts.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {searchQuery || debouncedSearch
                ? t("noCustomerProductsFound")
                : t("noCustomerProductsAvailable")}
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

      {/* Detail Modal */}
      {(selectedProduct || loadingDetail) && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !loadingDetail && setSelectedProduct(null)}
        >
          <Card
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <CardTitle className="text-2xl">
                {t("customerProductDetails")}
              </CardTitle>
              <div className="flex gap-2">
                {selectedProduct && !loadingDetail && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchProductBookings}
                    disabled={loadingBookings}
                    className="gap-2"
                  >
                    {loadingBookings ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                    {t("viewBookings")}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => !loadingDetail && setSelectedProduct(null)}
                  disabled={loadingDetail}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : selectedProduct ? (
                <>
                  {/* Product Info */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <AirVent className="h-5 w-5" />
                      {selectedProduct.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">
                          {t("serialNumber")}
                        </Label>
                        <p className="font-mono font-medium">
                          {getSerialFromQrUrl(selectedProduct.qrUrl)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          {t("productNickname")}
                        </Label>
                        <p className="font-medium">
                          {selectedProduct.name || "—"}
                        </p>
                      </div>
                      {selectedProduct.product && (
                        <>
                          <div>
                            <Label className="text-muted-foreground">
                              {t("product")}
                            </Label>
                            <p className="font-medium">
                              {selectedProduct.product.name}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">
                              {t("brand")}
                            </Label>
                            <p className="font-medium">
                              {selectedProduct.product.brand}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">
                              {t("productModel")}
                            </Label>
                            <p className="font-medium">
                              {selectedProduct.product.productModel}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">
                              {t("type")}
                            </Label>
                            <p className="font-medium capitalize">
                              {selectedProduct.product.type}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Warranty Information */}
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg border">
                      <h4 className="font-medium text-sm text-muted-foreground mb-3">
                        {t("warrantyInformation")}
                      </h4>
                      {selectedProduct.purchaseCode ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-muted-foreground text-xs">
                              {t("purchaseCode")}
                            </Label>
                            <p className="font-medium">{selectedProduct.purchaseCode}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs">
                              {t("purchased")}
                            </Label>
                            <p className="font-medium">
                              {selectedProduct.purchaseDate
                                ? formatDate(selectedProduct.purchaseDate)
                                : "—"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs">
                              {t("warrantyUntil")}
                            </Label>
                            <p className="font-medium">
                              {selectedProduct.warrantyEndDate
                                ? formatDate(selectedProduct.warrantyEndDate)
                                : "—"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          {t("noWarrantyInformation")}
                        </p>
                      )}
                    </div>
                    {selectedProduct.product?.productImages?.length ? (
                      <div className="mt-4">
                        <Label className="text-muted-foreground flex items-center gap-2 mb-2">
                          {t("productImages")}
                        </Label>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {selectedProduct.product.productImages.map((img) => (
                            <div
                              key={img.id}
                              className="relative w-24 h-24 rounded-lg overflow-hidden border bg-muted flex-shrink-0"
                            >
                              <Image
                                src={img.url}
                                alt="Product"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Customer Info */}
                  {selectedProduct.customer && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        {t("customerInformation")}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">
                            {t("name")}
                          </Label>
                          <p className="font-medium">
                            {selectedProduct.customer.name}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">
                            {t("email")}
                          </Label>
                          <p className="font-medium">
                            {selectedProduct.customer.email}
                          </p>
                        </div>
                        {selectedProduct.customer.phoneNo && (
                          <div>
                            <Label className="text-muted-foreground">
                              {t("phone")}
                            </Label>
                            <p className="font-medium">
                              {selectedProduct.customer.phoneNo}
                            </p>
                          </div>
                        )}
                        {selectedProduct.customer.primaryAddress && (
                          <>
                            <div className="col-span-2">
                              <Label className="text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {t("address")}
                              </Label>
                              <p className="font-medium mt-1">
                                {selectedProduct.customer.primaryAddress.address}
                                , {selectedProduct.customer.primaryAddress.township}
                                , {selectedProduct.customer.primaryAddress.city},{" "}
                                {selectedProduct.customer.primaryAddress.district}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <Label className="text-muted-foreground">
                        {t("registeredOn")}
                      </Label>
                      <p className="text-sm">
                        {formatDate(selectedProduct.createdAt)}
                      </p>
                    </div>
                    {selectedProduct.updatedAt && (
                      <div>
                        <Label className="text-muted-foreground">
                          {t("lastUpdated")}
                        </Label>
                        <p className="text-sm">
                          {formatDate(selectedProduct.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </CardContent>
            {selectedProduct && !loadingDetail && (
              <div className="p-4 border-t bg-background">
                <Button
                  className="w-full"
                  onClick={() => setSelectedProduct(null)}
                >
                  {t("close")}
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Product Bookings Modal */}
      {showBookingsModal && selectedProduct && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowBookingsModal(false);
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
                onClick={() => setShowBookingsModal(false)}
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
                                : booking.status === "inprogress" ||
                                    booking.status === "in_progress"
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                                : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            }`}
                          >
                            {t(booking.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <Label className="text-muted-foreground">
                              {t("bookingTime")}
                            </Label>
                            <p className="font-medium">
                              {formatTimeTo12Hour(booking.bookingTime)}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">
                              {t("duration")}
                            </Label>
                            <p className="font-medium">
                              {booking.duration} {t("min")}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">
                              {t("fees")}
                            </Label>
                            <p className="font-medium">
                              {formatCurrency(booking.fees)} Ks
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">
                              {t("technician")}
                            </Label>
                            <p className="font-medium">
                              {booking.technician?.name || t("notAssigned")}
                            </p>
                          </div>
                        </div>
                        {booking.bookingServices &&
                          booking.bookingServices.length > 0 && (
                            <div>
                              <Label className="text-muted-foreground">
                                {t("services")}
                              </Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {booking.bookingServices.map((s: any, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                                  >
                                    {s.service?.name}
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
              <CardTitle className="text-2xl">
                {t("bookingDetails")}
              </CardTitle>
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
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">
                  {t("customerInformation")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">
                      {t("name")}
                    </Label>
                    <p className="font-medium">
                      {selectedBookingDetail.aircon?.customer?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      {t("email")}
                    </Label>
                    <p className="font-medium">
                      {selectedBookingDetail.aircon?.customer?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      {t("phone")}
                    </Label>
                    <p className="font-medium">
                      {selectedBookingDetail.aircon?.customer?.phoneNo || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      {t("product")}
                    </Label>
                    <p className="font-medium">
                      {selectedBookingDetail.aircon?.product?.name || "N/A"}
                    </p>
                  </div>
                  {selectedBookingDetail.aircon?.name && (
                    <div>
                      <Label className="text-muted-foreground">
                        {t("productNickname")}
                      </Label>
                      <p className="font-medium">
                        {selectedBookingDetail.aircon.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  {t("requestedServices")}
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedBookingDetail.bookingServices?.map((s: any) => (
                    <span
                      key={s.service.id}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {s.service?.name} - {formatCurrency(s.service?.serviceFee)} Ks
                    </span>
                  )) || <p>{t("noServices")}</p>}
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">
                  {t("assignedTechnician")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">
                      {t("name")}
                    </Label>
                    <p className="font-medium">
                      {selectedBookingDetail.technician?.name ||
                        t("notAssigned")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      {t("phone")}
                    </Label>
                    <p className="font-medium">
                      {selectedBookingDetail.technician?.phoneNo || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {selectedBookingDetail.serviceAddress && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">
                    {t("serviceAddress")}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedBookingDetail.serviceAddress.name && (
                      <div>
                        <Label className="text-muted-foreground">
                          {t("name")}
                        </Label>
                        <p className="font-medium">
                          {selectedBookingDetail.serviceAddress.name}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">
                        {t("address")}
                      </Label>
                      <p className="font-medium">
                        {selectedBookingDetail.serviceAddress.address}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        {t("township")}
                      </Label>
                      <p className="font-medium">
                        {selectedBookingDetail.serviceAddress.township}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        {t("city")}
                      </Label>
                      <p className="font-medium">
                        {selectedBookingDetail.serviceAddress.city}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">
                        {t("district")}
                      </Label>
                      <p className="font-medium">
                        {selectedBookingDetail.serviceAddress.district}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">
                    {t("status")}
                  </Label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm mt-1 ${getStatusColor(
                      selectedBookingDetail.status
                    )}`}
                  >
                    {t(selectedBookingDetail.status)}
                  </span>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    {t("scheduledDate")}
                  </Label>
                  <p className="font-medium mt-1">
                    {formatDate(selectedBookingDetail.bookingForDate)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    {t("bookingTime")}
                  </Label>
                  <p className="font-medium mt-1">
                    {formatTimeTo12Hour(selectedBookingDetail.bookingTime)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    {t("duration")}
                  </Label>
                  <p className="font-medium mt-1">
                    {selectedBookingDetail.duration} {t("minutes")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    {t("fees")}
                  </Label>
                  <p className="font-medium mt-1">
                    {formatCurrency(selectedBookingDetail.fees)} Ks
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  {t("description")}
                </Label>
                <p className="mt-1 whitespace-pre-wrap">
                  {selectedBookingDetail.description ||
                    t("noDescriptionProvided")}
                </p>
              </div>

              {selectedBookingDetail.bookingImages &&
                selectedBookingDetail.bookingImages.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-2">
                      {t("photos")} (
                      {selectedBookingDetail.bookingImages.length})
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

              {/* Customer Feedback */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">{t("customerFeedback")}</h3>
                {selectedBookingDetail.feedback ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">{t("feedbackRating")}</Label>
                        <p className="font-medium">{selectedBookingDetail.feedback.rating}/5</p>
                      </div>
                      {selectedBookingDetail.feedback.satisfaction != null && (
                        <div>
                          <Label className="text-muted-foreground">{t("feedbackSatisfaction")}</Label>
                          <p className="font-medium">{selectedBookingDetail.feedback.satisfaction}/5</p>
                        </div>
                      )}
                      {selectedBookingDetail.feedback.issueResolved != null && (
                        <div>
                          <Label className="text-muted-foreground">{t("issueResolved")}</Label>
                          <p className="font-medium">{selectedBookingDetail.feedback.issueResolved ? t("yes") : t("no")}</p>
                        </div>
                      )}
                    </div>
                    {selectedBookingDetail.feedback.note && (
                      <div>
                        <Label className="text-muted-foreground">{t("feedbackNote")}</Label>
                        <p className="mt-1 whitespace-pre-wrap">{selectedBookingDetail.feedback.note}</p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">{t("created")}: {formatDate(selectedBookingDetail.feedback.createdAt)}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t("noFeedbackYet")}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground">
                    {t("created")}
                  </Label>
                  <p className="text-sm">
                    {formatDate(selectedBookingDetail.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    {t("lastUpdated")}
                  </Label>
                  <p className="text-sm">
                    {formatDate(selectedBookingDetail.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
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
    </div>
  );
};

export default CustomerProductsPage;
