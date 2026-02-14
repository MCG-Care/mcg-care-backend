export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Booking {
  id: string;
  technicianId: string;
  airconId: string;
  bookingOnDate: string;
  bookingForDate: string;
  bookingTime: string;
  duration: number;
  fees: string;
  status: "pending" | "confirmed" | "in_progress" | "inprogress" | "completed" | "done" | "cancelled" | "unsuccessful";
  description?: string;
  createdAt: string;
  updatedAt: string;
  aircon?: {
    id: string;
    name: string;
    customer?: {
      id: string;
      name: string;
      email: string;
      phoneNo: string;
    };
    product?: {
      id: string;
      name: string;
    };
  };
  technician?: {
    id: string;
    name: string;
    email: string;
    phoneNo: string;
  };
  bookingServices?: Array<{
    service: {
      id: string;
      name: string;
      serviceFee: string;
      duration: number;
    };
  }>;
  bookingImages?: Array<{
    id: string;
    url: string;
  }>;
  serviceAddress?: {
    id: number;
    userId: number;
    name?: string;
    address: string;
    township: string;
    city: string;
    district: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  userId: string;
  likeCount: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  images?: Array<{
    id: string;
    url: string;
  }>;
  comments?: Array<{
    id: string;
    content: string;
    likeCount: number;
    createdAt: string;
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  serviceFee: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  productModel: string;
  brand: string;
  type: "split" | "window" | "cassette" | "portable" | "central";
  price: string;
  description?: string;
  capacity?: number;
  energyRating?: number;
  coolingPower?: number;
  refrigerant?: string;
  warranty?: number;
  tagline?: string;
  voltageAverage?: number;
  voltageCount?: number;
  releaseDate?: string;
  createdAt?: string;
  updatedAt?: string;
  productImages?: Array<{
    id: string;
    productId: string;
    url: string;
  }>;
}

export interface DashboardStats {
  pendingBookings: number;
  inProgressBookings: number;
  todayBookings: number;
  upcomingBookings: number;
}

export interface AddressInfo {
  id: number;
  name?: string;
  address: string;
  township: string;
  city: string;
  district: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNo: string;
  role: "customer" | "technician" | "admin";
  primaryAddressId?: number | null;
  address?: AddressInfo | null;
  primaryAddress?: AddressInfo | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phoneNo: string;
  role: "technician";
  primaryAddressId?: number | null;
  address?: AddressInfo | null;
  primaryAddress?: AddressInfo | null;
  averageRating?: number;
  totalFeedbacks?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerProduct {
  id: string;
  customerId: string;
  productId: string;
  name: string;
  qrUrl: string;
  purchaseDate?: string;
  warrantyEndDate?: string;
  purchaseCode?: string;
  product?: Product;
  customer?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface TechnicianService {
  id: string;
  technicianId: string;
  serviceId: string;
  service?: ServiceType;
}

export interface Timeslot {
  id: string;
  technicianId: string;
  date: string;
  slots: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeOffRequest {
  id: string;
  technicianId: number;
  startDate: string;
  endDate: string;
  startSlot: number;
  endSlot: number;
  isFullDay: boolean;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  reviewerId?: number | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  updatedAt: string;
  technician?: {
    id: number;
    name: string;
    email: string;
    phoneNo: string;
  };
  reviewer?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export type Language = "en" | "my";

export interface Translations {
  [key: string]: string;
}
