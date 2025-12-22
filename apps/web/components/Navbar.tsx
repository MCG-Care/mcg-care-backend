"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Globe, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter, usePathname } from "next/navigation";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("admin_user");
    router.push("/login");
  };

  const getPageTitle = () => {
    if (pathname === "/dashboard") return t("dashboard");
    if (pathname === "/dashboard/bookings") return t("bookings");
    if (pathname === "/dashboard/forum") return t("forum");
    if (pathname === "/dashboard/services") return t("services");
    if (pathname === "/dashboard/products") return t("products");
    if (pathname === "/dashboard/technicians") return t("technicians");
    if (pathname === "/dashboard/customers") return t("customers");
    if (pathname === "/dashboard/profile") return t("profile");
    return t("dashboard");
  };

  return (
    <nav className="fixed top-0 right-0 left-0 lg:left-64 h-20 bg-card border-b border-border z-30">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold hidden md:block">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </button>
          )}

          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-accent transition-colors"
            >
              <Globe className="h-5 w-5" />
            </button>
            {showLangMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLangMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-32 bg-popover border border-border rounded-md shadow-lg z-50">
                  <div
                    className="px-4 py-2 hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setLanguage("en");
                      setShowLangMenu(false);
                    }}
                  >
                    English
                  </div>
                  <div
                    className="px-4 py-2 hover:bg-accent cursor-pointer"
                    onClick={() => {
                      setLanguage("my");
                      setShowLangMenu(false);
                    }}
                  >
                    မြန်မာ
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </button>
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-50">
                  <div
                    className="px-4 py-2 hover:bg-accent cursor-pointer flex items-center gap-2"
                    onClick={() => {
                      router.push("/dashboard/profile");
                      setShowProfileMenu(false);
                    }}
                  >
                    <User className="h-4 w-4" />
                    {t("profile")}
                  </div>
                  <div className="h-px bg-border my-1" />
                  <div
                    className="px-4 py-2 hover:bg-accent cursor-pointer flex items-center gap-2 text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
