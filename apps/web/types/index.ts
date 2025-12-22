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
  status: "pending" | "inprogress" | "done" | "unsuccessful";
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
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  images?: Array<{
    id: string;
    url: string;
  }>;
  comments?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author?: {
      id: string;
      name: string;
      email: string;
    };
  }>;
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
