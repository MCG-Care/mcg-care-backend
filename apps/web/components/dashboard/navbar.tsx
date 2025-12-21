"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  Globe,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    console.log("Current theme:", theme);
    setTheme(theme === "dark" ? "light" : "dark");
    console.log("Switched to:", theme === "dark" ? "light" : "dark");
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    setShowLangMenu(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    router.push("/login");
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("common.search")}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="relative"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </Button>
          )}

          {/* Language Selector */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLangMenu(!showLangMenu)}
            >
              <Globe className="h-5 w-5" />
            </Button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => changeLanguage("en")}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800",
                    i18n.language === "en" ? "bg-gray-100 dark:bg-gray-800 font-medium" : ""
                  )}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage("my")}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800",
                    i18n.language === "my" ? "bg-gray-100 dark:bg-gray-800 font-medium" : ""
                  )}
                >
                  မြန်မာ
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {localStorage.getItem("userEmail") || "admin@mcgcare.com"}
                </p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/dashboard/profile");
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  {t("navbar.profile")}
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/dashboard/settings");
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {t("navbar.settings")}
                </button>
                <div className="border-t border-gray-200 dark:border-gray-800"></div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-red-600 dark:text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                  {t("navbar.logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

