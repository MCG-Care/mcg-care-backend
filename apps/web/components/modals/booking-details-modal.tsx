"use client";

import { useState } from "react";
import { X, Edit, Trash2, Calendar, Clock, DollarSign, User, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

const API_BASE_URL = "https://mcg-care-backend.onrender.com";

interface BookingDetailsModalProps {
  booking: any;
  onClose: () => void;
  onUpdate: () => void;
}

export function BookingDetailsModal({ booking, onClose, onUpdate }: BookingDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: booking.status || "",
    fees: booking.fees || "",
    description: booking.description || "",
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    if (!isNaN(Number(timeString))) {
      const hour = Number(timeString);
      return `${hour}:00`;
    }
    return timeString;
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/[_-]/g, "");
    switch (normalizedStatus) {
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "inprogress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "unsuccessful":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const handleUpdate = async () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      alert("Please login to update bookings");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: formData.status,
          fees: parseFloat(formData.fees),
          description: formData.description,
        }),
      });

      if (response.ok) {
        alert("Booking updated successfully!");
        setIsEditing(false);
        onUpdate();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      alert("Please login to delete bookings");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${booking.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        alert("Booking deleted successfully!");
        onUpdate();
        onClose();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Booking Details #{booking.id}</CardTitle>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:text-red-700"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div>
            <Label>Status</Label>
            {isEditing ? (
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <option value="pending">Pending</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
                <option value="unsuccessful">Unsuccessful</option>
              </select>
            ) : (
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            )}
          </div>

          {/* Customer & Technician */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </Label>
              <p className="mt-1 text-lg font-semibold">
                {booking.aircon?.customer?.name || "Unknown"}
              </p>
              <p className="text-sm text-gray-500">
                Phone: {booking.aircon?.customer?.phoneNo || "N/A"}
              </p>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Technician
              </Label>
              <p className="mt-1 text-lg font-semibold">
                {booking.technician?.name || "Not Assigned"}
              </p>
              <p className="text-sm text-gray-500">
                Phone: {booking.technician?.phoneNo || "N/A"}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Booking Date
              </Label>
              <p className="mt-1 text-lg">{formatDate(booking.bookingForDate)}</p>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Booking Time
              </Label>
              <p className="mt-1 text-lg">{formatTime(booking.bookingTime)}</p>
            </div>
          </div>

          {/* Services */}
          <div>
            <Label>Requested Services</Label>
            <div className="mt-2 space-y-2">
              {booking.bookingServices && booking.bookingServices.length > 0 ? (
                booking.bookingServices.map((bs: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span>{bs.service?.name || "Unknown Service"}</span>
                    <span className="text-sm text-gray-500">
                      ${bs.service?.serviceFee || "0.00"} • {bs.service?.duration || 0} min
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No services listed</p>
              )}
            </div>
          </div>

          {/* Fees */}
          <div>
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Fees
            </Label>
            {isEditing ? (
              <Input
                type="number"
                step="0.01"
                value={formData.fees}
                onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 text-2xl font-bold text-red-600">
                ${booking.fees || "0.00"}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full mt-1 min-h-[100px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            ) : (
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {booking.description || "No description provided"}
              </p>
            )}
          </div>

          {/* Images */}
          {booking.bookingImages && booking.bookingImages.length > 0 && (
            <div>
              <Label>Photos</Label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                {booking.bookingImages.map((img: any, index: number) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={img.url}
                      alt={`Booking image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    status: booking.status || "",
                    fees: booking.fees || "",
                    description: booking.description || "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                onClick={handleUpdate}
              >
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
