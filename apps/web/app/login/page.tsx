"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Moon, Sun, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import Image from "next/image";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // API returns access_token not token
      if (response.data.access_token) {
        localStorage.setItem("auth_token", response.data.access_token);
        
        // Store user info from response
        if (response.data.user) {
          localStorage.setItem("admin_user", JSON.stringify({
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name,
            role: response.data.user.role,
            phoneNo: response.data.user.phoneNo,
            primaryAddressId: response.data.user.primaryAddressId,
            address: response.data.user.address,
          }));
        } else {
          // Fallback to email if user object not present
          localStorage.setItem("admin_user", JSON.stringify({
            email: email,
            name: "Admin",
          }));
        }
        
        // Use window.location for more reliable navigation
        window.location.href = "/dashboard";
      } else {
        setError("Invalid response from server. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        err.message ||
        "Login failed. Please check your credentials and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Theme and Language Controls - Top Right */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-foreground"
            aria-label="Select language"
          >
            <Globe className="h-5 w-5" />
          </button>
          {showLangMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowLangMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-32 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden">
                <button
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors text-foreground"
                  onClick={() => {
                    setLanguage("en");
                    setShowLangMenu(false);
                  }}
                >
                  English
                </button>
                <button
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors text-foreground border-t border-border"
                  onClick={() => {
                    setLanguage("my");
                    setShowLangMenu(false);
                  }}
                >
                  မြန်မာ
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main content - centered */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Branding */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 text-center">
            <div className="flex justify-center">
              <div className="relative w-44 h-44 rounded-2xl overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="MCG Care Logo"
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-bold text-primary">
                MCG Care
              </h1>
              <p className="text-xl text-muted-foreground">
                Admin Dashboard
              </p>
            </div>
            <p className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Manage your bookings, customers, and services all in one place.
            </p>
          </div>

          {/* Right side - Login Form */}
          <Card className="w-full max-w-md mx-auto border-border shadow-lg">
            <CardHeader className="space-y-2 pb-4">
              <div className="flex justify-center lg:hidden mb-2">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="MCG Care Logo"
                    fill
                    className="object-contain p-2"
                    priority
                  />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                {t("welcomeBack")}
              </CardTitle>
              <CardDescription className="text-center">
                {t("pleaseLogin")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    {t("email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@mcgcare.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    {t("password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-start gap-2">
                    <span className="text-lg shrink-0">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("loading")}
                    </>
                  ) : (
                    t("login")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


