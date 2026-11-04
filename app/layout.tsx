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
    icon: [{ url: "/pwa-icon?size=192", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/pwa-icon?size=180&maskable=1", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B6645",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-200 font-sans text-slate-900 antialiased">
        {/* Kolom selebar HP; di desktop tampil di tengah layar */}
        <div className="relative mx-auto min-h-dvh w-full max-w-[430px] bg-brand-surface sm:shadow-2xl">
          {children}
        </div>
        <RegistrasiSW />
      </body>
    </html>
  );
}
