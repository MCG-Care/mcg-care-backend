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
    clearFilters: "Clear Filters",
    clearSort: "Clear Sort",
    
    // Services
    manageServices: "Manage Services here...",
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
    sortBy: "Sort By",
    sortByFeesAsc: "Fees: Low to High",
    sortByFeesDesc: "Fees: High to Low",
    sortByDurationAsc: "Duration: Short to Long",
    sortByDurationDesc: "Duration: Long to Short",
    sortByPriceAsc: "Price: Low to High",
    sortByPriceDesc: "Price: High to Low",
    sortByCapacityAsc: "Capacity: Low to High",
    sortByCapacityDesc: "Capacity: High to Low",
    sortByDateAsc: "Date: Oldest First",
    sortByDateDesc: "Date: Newest First",
    filterByType: "Filter by Type",
    allTypes: "All Types",
    clearFilter: "Clear Filter",
    
    // Forum
    forumPosts: "Manage Forum Posts here...",
    noPostsYet: "No forum posts yet",
    forumSearchHint: "Type in Post Title or Content or Username to search...",
    
    // Bookings
    allBookings: "Manage All Bookings here...",
    noBookingsYet: "No bookings yet",
    bookingsSearchHint: "Type in Customer Name or Technician Name to search...",
    
    // Products
    manageProducts: "Manage Products here...",
    addProduct: "Add Product",
    createProduct: "Create Product",
    editProduct: "Edit Product",
    productName: "Product Name",
    productModel: "Product Model",
    brand: "Brand",
    type: "Type",
    price: "Price",
    capacity: "Capacity (HP)",
    energyRating: "Energy Rating",
    coolingPower: "Cooling Power (BTU)",
    refrigerant: "Refrigerant",
    warranty: "Warranty (years)",
    years: "years",
    tagline: "Tagline",
    voltageAverage: "Voltage Average (V)",
    voltageCount: "Voltage Count",
    releaseDate: "Release Date",
    productImages: "Product Images",
    uploadImages: "Upload Images",
    searchProducts: "Search products...(type in Product Name or Model or Brand to search)",
    noProductsFound: "No products found matching your search",
    noProductsAvailable: "No products available. Create one to get started!",
    viewDetails: "View Details",
    deleteProduct: "Delete Product",
    deleteImage: "Delete Image",
    areYouSureDeleteProduct: "Are you sure you want to delete this product?",
    areYouSureDeleteImage: "Are you sure you want to delete this image?",
    selectImages: "Select Images",
    imagesSelected: "images selected",
    split: "Split",
    window: "Window",
    cassette: "Cassette",
    portable: "Portable",
    central: "Central",
    
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
    dashboard: "ဒက်ရှ်ဘုတ်",
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
    clearFilters: "စစ်ထုတ်မှုများ ဖယ်ရှားမည်",
    clearSort: "အမျိုးအစားခွဲမှု ဖယ်ရှားမည်",
    
    // Services
    manageServices: "ဝန်ဆောင်မှုအမျိုးအစားများအား ဤတွင်စီမံနိုင်ပါသည်...",
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
    sortBy: "အမျိုးအစားခွဲမည်",
    sortByFeesAsc: "ဝန်ဆောင်ခ: နည်းမှ များသို့",
    sortByFeesDesc: "ဝန်ဆောင်ခ: များမှ နည်းသို့",
    sortByDurationAsc: "ကြာချိန်: တိုမှ ရှည်သို့",
    sortByDurationDesc: "ကြာချိန်: ရှည်မှ တိုသို့",
    sortByPriceAsc: "စျေးနှုန်း: နည်းမှ များသို့",
    sortByPriceDesc: "စျေးနှုန်း: များမှ နည်းသို့",
    sortByCapacityAsc: "စွမ်းအား: နည်းမှ များသို့",
    sortByCapacityDesc: "စွမ်းအား: များမှ နည်းသို့",
    sortByDateAsc: "ရက်စွဲ: ဟောင်းမှ သစ်သို့",
    sortByDateDesc: "ရက်စွဲ: သစ်မှ ဟောင်းသို့",
    filterByType: "အမျိုးအစားဖြင့် စစ်ထုတ်မည်",
    allTypes: "အားလုံး",
    clearFilter: "စစ်ထုတ်မှု ဖယ်ရှားမည်",
    
    // Forum
    forumPosts: "ဖိုရမ် ပို့စ်များအား ဤတွင်စီမံနိုင်ပါသည်...",
    noPostsYet: "ဖိုရမ် ပို့စ်များမရှိသေးပါ",
    forumSearchHint: "ပို့စ်ခေါင်းစဉ်၊ အကြောင်းအရာ သို့မဟုတ် အသုံးပြုသူအမည်ကို ရိုက်ထည့်ပြီး ရှာဖွေပါ...",
    
    // Bookings
    allBookings: "ကြိုတင်မှာကြားမှုများအား ဤတွင်စီမံနိုင်ပါသည်...",
    noBookingsYet: "ကြိုတင်မှာကြားမှုများမရှိသေးပါ",
    bookingsSearchHint: "ဖောက်သည်အမည် သို့မဟုတ် နည်းပညာရှင်အမည်ကို ရိုက်ထည့်ပြီး ရှာဖွေပါ...",
    
    // Products
    manageProducts: "ထုတ်ကုန်များအား ဤတွင်စီမံနိုင်ပါသည်...",
    addProduct: "ထုတ်ကုန် ထည့်မည်",
    createProduct: "ထုတ်ကုန် ဖန်တီးမည်",
    editProduct: "ထုတ်ကုန် ပြင်ဆင်မည်",
    productName: "ထုတ်ကုန်အမည်",
    productModel: "ထုတ်ကုန်မော်ဒယ်",
    brand: "ကုန်အမှတ်တံဆိပ်",
    type: "အမျိုးအစား",
    price: "စျေးနှုန်း",
    capacity: "စွမ်းအား (HP)",
    energyRating: "စွမ်းအင်အဆင့်သတ်မှတ်ချက်",
    coolingPower: "အအေးပေးစွမ်းအား (BTU)",
    refrigerant: "အအေးပေးပစ္စည်း",
    warranty: "အာမခံ (နှစ်)",
    years: "နှစ်",
    tagline: "ဆောင်ပုဒ်",
    voltageAverage: "ဗို့အားပျမ်းမျှ (V)",
    voltageCount: "ဗို့အားအရေအတွက်",
    releaseDate: "ထုတ်ဝေရက်စွဲ",
    productImages: "ထုတ်ကုန်ပုံများ",
    uploadImages: "ပုံများ တင်မည်",
    searchProducts: "ထုတ်ကုန်များရှာမည်...(ထုတ်ကုန်အမည် သို့မဟုတ် မော်ဒယ်အမည် သို့မဟုတ် ကုန်အမှတ်တံဆိပ်အမည်ကို ရိုက်ထည့်ပြီး ရှာဖွေပါ...)",
    noProductsFound: "သင်ရှာသောထုတ်ကုန်များမတွေ့ပါ",
    noProductsAvailable: "ထုတ်ကုန်များမရှိသေးပါ။ စတင်ရန် တစ်ခုဖန်တီးပါ!",
    viewDetails: "အသေးစိတ်ကြည့်မည်",
    deleteProduct: "ထုတ်ကုန် ဖျက်မည်",
    deleteImage: "ပုံ ဖျက်မည်",
    areYouSureDeleteProduct: "ဤထုတ်ကုန်ကို ဖျက်ရန် သေချာပါသလား?",
    areYouSureDeleteImage: "ဤပုံကို ဖျက်ရန် သေချာပါသလား?",
    selectImages: "ပုံများ ရွေးချယ်မည်",
    imagesSelected: "ပုံများ ရွေးချယ်ထားပြီး",
    split: "Split",
    window: "Window",
    cassette: "Cassette",
    portable: "Portable",
    central: "Central",
    
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
