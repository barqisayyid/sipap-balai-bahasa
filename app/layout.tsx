import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIPAP - Balai Bahasa Sumatera Barat",
  description: "Sistem Informasi Penjadwalan & Agenda Pimpinan",
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
      </body>
    </html>
  );
}
