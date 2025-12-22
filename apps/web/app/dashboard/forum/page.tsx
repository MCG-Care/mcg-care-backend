"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const ForumPage = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("forum")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Forum Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-12">
            Forum management page - Coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForumPage;
