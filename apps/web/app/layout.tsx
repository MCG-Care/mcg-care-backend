import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MCG Care Admin",
  description: "Admin dashboard for MCG Care",
};

export default async function RootLayout({
  children,
  params,
  searchParams,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<Record<string, string | string[]>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>) {
  // Unwrap params and searchParams to prevent serialization errors
  // Even though we don't use them, Next.js tries to serialize them for DevTools
  // This prevents the "params/searchParams is a Promise" errors
  const unwrappedParams = params ? await params : undefined;
  const unwrappedSearchParams = searchParams ? await searchParams : undefined;
  
  // Prevent unused variable warnings
  void unwrappedParams;
  void unwrappedSearchParams;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
