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
    pendingBookings: "စောင့်ဆိုင်းဆဲ ကြိုတင်မှာကြားမှုများ",
    inProgressBookings: "ဆောင်ရွက်ဆဲ",
    todayBookings: "ယနေ့ ကြိုတင်မှာကြားမှုများ",
    upcomingBookings: "လာမည့် ကြိုတင်မှာကြားမှုများ",
    latestBookings: "နောက်ဆုံးကြိုတင်မှာကြားမှုများ",
    latestForumPosts: "နောက်ဆုံး Forum ပို့စ်များ",
    viewAll: "အားလုံးကြည့်ရန်",
    
    // Navigation
    bookings: "ကြိုတင်မှာကြားမှုများ",
    forum: "ဖိုရမ်",
    products: "ထုတ်ကုန်များ",
    technicians: "နည်းပညာရှင်များ",
    customers: "ဖောက်သည်များ",
    profile: "ကိုယ်ရေးအချက်အလက်",
    logout: "ထွက်ရန်",
    settings: "ဆက်တင်များ",
    
    // Common
    loading: "တင်နေသည်...",
    error: "အမှား",
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
