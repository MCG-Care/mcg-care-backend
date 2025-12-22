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

export interface DashboardStats {
  pendingBookings: number;
  inProgressBookings: number;
  todayBookings: number;
  upcomingBookings: number;
}

export type Language = "en" | "my";

export interface Translations {
  [key: string]: string;
}
