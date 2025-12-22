"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "@/types";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

type TranslationKeys = {
  [key: string]: string;
};

type Translations = {
  [K in Language]: TranslationKeys;
};

const translations: Translations = {
  en: {
    // Auth
    login: "Login",
    email: "Email",
    password: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    welcomeBack: "Welcome Back!",
    adminLogin: "Admin Login",
    pleaseLogin: "Please login to access your dashboard",
    
    // Dashboard
    dashboard: "Dashboard",
    pendingBookings: "Pending Bookings",
    inProgressBookings: "In Progress",
    todayBookings: "Today's Bookings",
    upcomingBookings: "Upcoming Bookings",
    latestBookings: "Latest Bookings",
    latestForumPosts: "Latest Forum Posts",
    viewAll: "View All",
    
    // Navigation
    bookings: "Bookings",
    forum: "Forum",
    services: "Services",
    products: "Products",
    technicians: "Technicians",
    customers: "Customers",
    profile: "Profile",
    logout: "Logout",
    settings: "Settings",
    
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    search: "Search",
    filter: "Filter",
    status: "Status",
    date: "Date",
    actions: "Actions",
    create: "Create",
    update: "Update",
    close: "Close",
    
    // Services
    addServiceType: "Add Service Type",
    createServiceType: "Create Service Type",
    editServiceType: "Edit Service Type",
    serviceName: "Service Name",
    description: "Description",
    serviceFee: "Service Fee (Ks)",
    duration: "Duration (minutes)",
    searchServices: "Search services...",
    noServicesFound: "No services found matching your search",
    noServicesAvailable: "No service types available. Create one to get started!",
    
    // Forum
    forumPosts: "Forum Posts",
    noPostsYet: "No forum posts yet",
    
    // Bookings
    allBookings: "All Bookings",
    noBookingsYet: "No bookings yet",
    
    // Booking statuses
    pending: "Pending",
    confirmed: "Confirmed",
    inProgress: "In Progress",
    inprogress: "In Progress",
    completed: "Completed",
    done: "Done",
    cancelled: "Cancelled",
    unsuccessful: "Unsuccessful",
    
    // Profile
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    language: "Language",
    english: "English",
    burmese: "Burmese",
  },
  my: {
    // Auth
    login: "ဝင်ရောက်ရန်",
    email: "အီးမေးလ်",
    password: "စကားဝှက်",
    rememberMe: "မှတ်ထားမည်",
    forgotPassword: "စကားဝှက်မေ့နေသလား?",
    welcomeBack: "ပြန်လည်ကြိုဆိုပါတယ်!",
    adminLogin: "အက်ဒမင် ဝင်ရောက်ရန်",
    pleaseLogin: "Dashboard ကိုဝင်ရောက်ရန် Login လုပ်ပါ",
    
    // Dashboard
    dashboard: "Dashboard",
    pendingBookings: "လုပ်ဆောင်ရန်ရှိသော ကြိုတင်မှာကြားမှုများ",
    inProgressBookings: "ဆောင်ရွက်ဆဲ ကြိုတင်မှာကြားမှုများ",
    todayBookings: "ယနေ့အတွက် ကြိုတင်မှာကြားမှုများ",
    upcomingBookings: "လာမည့် ကြိုတင်မှာကြားမှုများ",
    latestBookings: "နောက်ဆုံးလက်ခံရရှိသောကြိုတင်မှာကြားမှုများ",
    latestForumPosts: "နောက်ဆုံး Forum ပို့စ်များ",
    viewAll: "အားလုံးကြည့်ရန်",
    
    // Navigation
    bookings: "ကြိုတင်မှာကြားမှုများ",
    forum: "ဖိုရမ်",
    services: "ဝန်ဆောင်မှုများ",
    products: "ထုတ်ကုန်များ",
    technicians: "နည်းပညာရှင်များ",
    customers: "ဖောက်သည်များ",
    profile: "ကိုယ်ရေးအချက်အလက်",
    logout: "ထွက်ရန်",
    settings: "ဆက်တင်များ",
    
    // Common
    loading: "တင်နေသည်...",
    error: "မှားယွင်းပါသည်",
    success: "အောင်မြင်ပါသည်",
    save: "သိမ်းမည်",
    cancel: "မလုပ်တော့",
    delete: "ဖျက်မည်",
    edit: "ပြင်မည်",
    view: "ကြည့်မည်",
    search: "ရှာဖွေမည်",
    filter: "စစ်ထုတ်မည်",
    status: "အခြေအနေ",
    date: "ရက်စွဲ",
    actions: "လုပ်ဆောင်ချက်များ",
    create: "ဖန်တီးမည်",
    update: "အပ်ဒိတ်လုပ်မည်",
    close: "ပိတ်မည်",
    
    // Services
    addServiceType: "ဝန်ဆောင်မှုအမျိုးအစား ထည့်မည်",
    createServiceType: "ဝန်ဆောင်မှုအမျိုးအစား ဖန်တီးမည်",
    editServiceType: "ဝန်ဆောင်မှုအမျိုးအစား ပြင်ဆင်မည်",
    serviceName: "ဝန်ဆောင်မှုအမည်",
    description: "ဖော်ပြချက်",
    serviceFee: "ဝန်ဆောင်ခ (ကျပ်)",
    duration: "ကြာချိန် (မိနစ်)",
    searchServices: "ဝန်ဆောင်မှုများရှာမည်...",
    noServicesFound: "သင်ရှာသောဝန်ဆောင်မှုများမတွေ့ပါ",
    noServicesAvailable: "ဝန်ဆောင်မှုအမျိုးအစားများမရှိသေးပါ။ စတင်ရန် တစ်ခုဖန်တီးပါ!",
    
    // Forum
    forumPosts: "ဖိုရမ် ပို့စ်များ",
    noPostsYet: "ဖိုရမ် ပို့စ်များမရှိသေးပါ",
    
    // Bookings
    allBookings: "ကြိုတင်မှာကြားမှုအားလုံး",
    noBookingsYet: "ကြိုတင်မှာကြားမှုများမရှိသေးပါ",
    
    // Booking statuses
    pending: "စောင့်ဆိုင်းဆဲ",
    confirmed: "အတည်ပြုပြီး",
    inProgress: "ဆောင်ရွက်ဆဲ",
    inprogress: "ဆောင်ရွက်ဆဲ",
    completed: "ပြီးစီးပြီ",
    done: "ပြီးစီးပြီ",
    cancelled: "ပယ်ဖျက်ပြီး",
    unsuccessful: "မအောင်မြင်",
    
    // Profile
    darkMode: "မှောင်မိုက်မုဒ်",
    lightMode: "အလင်းမုဒ်",
    language: "ဘာသာစကား",
    english: "အင်္ဂလိပ်",
    burmese: "မြန်မာ",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    const translationMap = translations[language] as TranslationKeys;
    return translationMap[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
