"use client";

import { useTranslation } from "react-i18next";
import { User, Mail, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { t } = useTranslation();
  const userEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") || "admin@mcgcare.com" : "admin@mcgcare.com";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
          <User className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("navbar.profile")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            View and manage your profile information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Name
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                Admin User
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {userEmail}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                Administrator
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">
              Additional account settings and preferences will be available here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

