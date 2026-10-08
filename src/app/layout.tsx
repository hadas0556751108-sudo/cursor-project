import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { AppShell } from "@/components/layout/app-shell";

const inter = localFont({
  src: "../../public/fonts/Inter-Variable.ttf",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HubOffice - Medical Center ERP",
  description: "Modern operations management system for medical centers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={inter.className}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
