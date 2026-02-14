"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import { CustomerProduct } from "@/types";
import Image from "next/image";

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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => !loadingDetail && setSelectedProduct(null)}
                disabled={loadingDetail}
              >
                <X className="h-4 w-4" />
              </Button>
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
    </div>
  );
};

export default CustomerProductsPage;
