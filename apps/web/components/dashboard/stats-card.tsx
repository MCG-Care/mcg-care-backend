"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
}

export function StatsCard({ title, value, icon: Icon, gradient }: StatsCardProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-0">
        <div className={`p-6 ${gradient}`}>
          <div className="flex items-center justify-between">
            <div className="text-white">
              <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
              <h3 className="text-3xl font-bold">{value}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

