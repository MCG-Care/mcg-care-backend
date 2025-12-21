"use client";

import { useTranslation } from "react-i18next";
import { UserCog } from "lucide-react";

export default function TechniciansPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
          <UserCog className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("sidebar.technicians")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your technicians and their schedules
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
        <UserCog className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Technicians Page
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          This is a mock page. Content will be implemented later.
        </p>
      </div>
    </div>
  );
}

