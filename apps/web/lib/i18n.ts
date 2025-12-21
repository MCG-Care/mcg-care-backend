import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      // Login Page
      "login.title": "Welcome Back",
      "login.subtitle": "Sign in to your admin account",
      "login.email": "Email",
      "login.password": "Password",
      "login.rememberMe": "Remember me",
      "login.forgotPassword": "Forgot password?",
      "login.signIn": "Sign In",
      "login.emailPlaceholder": "admin@example.com",
      "login.passwordPlaceholder": "Enter your password",
      
      // Dashboard
      "dashboard.title": "Dashboard",
      "dashboard.welcome": "Welcome back, Admin!",
      "dashboard.subtitle": "Here's what's happening with your business today.",
      "dashboard.pending": "Pending",
      "dashboard.inProgress": "In Progress",
      "dashboard.inprogress": "In Progress",
      "dashboard.done": "Done",
      "dashboard.unsuccessful": "Unsuccessful",
      "dashboard.today": "Today",
      "dashboard.upcoming": "Upcoming",
      "dashboard.bookings": "Bookings",
      "dashboard.latestBookings": "Latest Bookings",
      "dashboard.latestPosts": "Latest Forum Posts",
      "dashboard.viewAll": "View All",
      "dashboard.customer": "Customer",
      "dashboard.service": "Service",
      "dashboard.date": "Date",
      "dashboard.status": "Status",
      "dashboard.actions": "Actions",
      "dashboard.author": "Author",
      "dashboard.title_post": "Title",
      "dashboard.category": "Category",
      "dashboard.replies": "Replies",
      
      // Sidebar
      "sidebar.dashboard": "Dashboard",
      "sidebar.bookings": "Bookings",
      "sidebar.forum": "Forum",
      "sidebar.services": "Services",
      "sidebar.products": "Products",
      "sidebar.technicians": "Technicians",
      "sidebar.customers": "Customers",
      
      // Navbar
      "navbar.profile": "Profile",
      "navbar.settings": "Settings",
      "navbar.logout": "Logout",
      
      // Common
      "common.search": "Search...",
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success",
    },
  },
  my: {
    translation: {
      // Login Page
      "login.title": "ပြန်လည်ကြိုဆိုပါတယ်",
      "login.subtitle": "သင့်အက်ဒမင်အကောင့်သို့ ဝင်ရောက်ပါ",
      "login.email": "အီးမေးလ်",
      "login.password": "စကားဝှက်",
      "login.rememberMe": "ကျွန်ုပ်ကို မှတ်ထားပါ",
      "login.forgotPassword": "စကားဝှက် မေ့နေပါသလား?",
      "login.signIn": "ဝင်ရောက်ရန်",
      "login.emailPlaceholder": "admin@example.com",
      "login.passwordPlaceholder": "သင့်စကားဝှက်ကို ထည့်ပါ",
      
      // Dashboard
      "dashboard.title": "ဒက်ရှ်ဘုတ်",
      "dashboard.welcome": "ပြန်လည်ကြိုဆိုပါတယ်၊ အက်ဒမင်!",
      "dashboard.subtitle": "ယနေ့ သင့်လုပ်ငန်းတွင် ဖြစ်ပျက်နေသော အရာများမှာ ဤသို့ဖြစ်သည်။",
      "dashboard.pending": "လုပ်ဆောင်ရန်ရှိသော",
      "dashboard.inProgress": "လုပ်ဆောင်နေသော",
      "dashboard.inprogress": "လုပ်ဆောင်နေသော",
      "dashboard.done": "ပြီးစီးသော",
      "dashboard.unsuccessful": "မအောင်မြင်သော",
      "dashboard.today": "ယနေ့",
      "dashboard.upcoming": "လာမည့်",
      "dashboard.bookings": "ကြိုတင်စာရင်းများ",
      "dashboard.latestBookings": "နောက်ဆုံး ကြိုတင်စာရင်းများ",
      "dashboard.latestPosts": "နောက်ဆုံး ဖိုရမ်ပို့စ်များ",
      "dashboard.viewAll": "အားလုံးကြည့်ရန်",
      "dashboard.customer": "ဖောက်သည်",
      "dashboard.service": "ဝန်ဆောင်မှု",
      "dashboard.date": "ရက်စွဲ",
      "dashboard.status": "အခြေအနေ",
      "dashboard.actions": "လုပ်ဆောင်ချက်များ",
      "dashboard.author": "စာရေးသူ",
      "dashboard.title_post": "ခေါင်းစဉ်",
      "dashboard.category": "အမျိုးအစား",
      "dashboard.replies": "ပြန်ကြားချက်များ",
      
      // Sidebar
      "sidebar.dashboard": "ဒက်ရှ်ဘုတ်",
      "sidebar.bookings": "ကြိုတင်စာရင်းများ",
      "sidebar.forum": "ဖိုရမ်",
      "sidebar.services": "ဝန်ဆောင်မှုများ",
      "sidebar.products": "ထုတ်ကုန်များ",
      "sidebar.technicians": "နည်းပညာရှင်များ",
      "sidebar.customers": "ဖောက်သည်များ",
      
      // Navbar
      "navbar.profile": "ပရိုဖိုင်",
      "navbar.settings": "ဆက်တင်များ",
      "navbar.logout": "အကောင့်ထွက်ရန်",
      
      // Common
      "common.search": "ရှာဖွေရန်...",
      "common.loading": "ခဏစောင့်ပါ...",
      "common.error": "တစ်စုံတစ်ရာမှားနေသည်",
      "common.success": "အောင်မြင်သည်",
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

