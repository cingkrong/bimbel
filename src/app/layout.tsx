import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { LoginApprovalModal } from "@/components/LoginApprovalModal";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LolosKampus | Portal Bimbel & CBT CAT BKN SKD Kedinasan & CPNS 2026",
  description: "Platform persiapan ujian CAT BKN PKN STAN, STIS, IPDN, dan CPNS 2026. Lengkap dengan simulasi 110 soal real-time, perangkingan nasional, dan analisis radar kelemahan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={montserrat.variable}>
      <body className="font-sans antialiased bg-slate-50 dark:bg-canvas-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col selection:bg-rose-500 selection:text-white">
        <Navbar />
        <LoginApprovalModal />
        <main className="flex-1">{children}</main>
        <MobileBottomNav />
      </body>
    </html>
  );
}

