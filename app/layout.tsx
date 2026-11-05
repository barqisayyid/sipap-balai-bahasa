import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { RegistrasiSW } from "@/components/pwa/registrasi-sw";

export const metadata: Metadata = {
  title: "SIPAP - Balai Bahasa Sumatera Barat",
  description: "Sistem Informasi Penjadwalan & Agenda Pimpinan",
  applicationName: "SIPAP",
  appleWebApp: { capable: true, title: "SIPAP", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A5C36",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-100 font-sans text-slate-900 antialiased selection:bg-brand-primary/10 selection:text-brand-primary">
        {/* Kontainer aplikasi: mobile-first, berbingkai bersih di desktop */}
        <div className="relative mx-auto min-h-dvh w-full max-w-[430px] bg-white sm:border-x sm:border-slate-200/80 sm:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          {children}
        </div>
        <RegistrasiSW />
      </body>
    </html>
  );
}
