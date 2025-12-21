"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Package,
  Users,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    key: "dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    key: "bookings",
    icon: Calendar,
    href: "/dashboard/bookings",
  },
  {
    key: "forum",
    icon: MessageSquare,
    href: "/dashboard/forum",
  },
  {
    key: "services",
    icon: Wrench,
    href: "/dashboard/services",
  },
  {
    key: "products",
    icon: Package,
    href: "/dashboard/products",
  },
  {
    key: "technicians",
    icon: UserCog,
    href: "/dashboard/technicians",
  },
  {
    key: "customers",
    icon: Users,
    href: "/dashboard/customers",
  },
];

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MC</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              MCG Care
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? t(`sidebar.${item.key}`) : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{t(`sidebar.${item.key}`)}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

