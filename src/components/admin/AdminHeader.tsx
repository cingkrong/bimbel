"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Bell,
  LogOut,
  ExternalLink,
  Command,
  Flag,
  Shield,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

interface AdminHeaderProps {
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
  } | null;
}

export function AdminHeader({ admin }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const getPageMeta = (path: string) => {
    if (path === "/admin") return { title: "Ringkasan Eksekutif", group: "Dashboard Utama" };
    if (path.startsWith("/admin/bank-soal")) return { title: "Master Bank Soal CAT", group: "Akademik BKN" };
    if (path.startsWith("/admin/tryout")) return { title: "Paket Tryout & Leaderboard", group: "Akademik BKN" };
    if (path.startsWith("/admin/laporan-soal")) return { title: "Moderasi Keluhan Soal", group: "Akademik BKN" };
    if (path.startsWith("/admin/bimbel")) return { title: "LMS & Kelas Live Zoom", group: "Bimbel Online" };
    if (path.startsWith("/admin/transaksi")) return { title: "Monitoring Transaksi", group: "Keuangan & Toko" };
    if (path.startsWith("/admin/kupon")) return { title: "Kupon Diskon", group: "Keuangan & Toko" };
    if (path.startsWith("/admin/afiliasi")) return { title: "Komisi Afiliasi", group: "Keuangan & Toko" };
    if (path.startsWith("/admin/siswa")) return { title: "Direktori & Sesi Siswa", group: "Operasional Sistem" };
    if (path.startsWith("/admin/pengaturan")) return { title: "Pengaturan & Whitelabel", group: "Operasional Sistem" };
    return { title: "Pusat Kontrol", group: "Admin Hub" };
  };

  const pageMeta = getPageMeta(pathname);

  const quickLinks = [
    { label: "Ringkasan Eksekutif", href: "/admin", group: "Utama" },
    { label: "Master Bank Soal CAT", href: "/admin/bank-soal", group: "Akademik" },
    { label: "Paket Tryout & Leaderboard", href: "/admin/tryout", group: "Akademik" },
    { label: "Moderasi Laporan Soal", href: "/admin/laporan-soal", group: "Akademik" },
    { label: "Bimbel, Live Zoom & Tugas", href: "/admin/bimbel", group: "LMS" },
    { label: "Monitoring Transaksi Invoice", href: "/admin/transaksi", group: "Finansial" },
    { label: "Kupon Promo Diskon", href: "/admin/kupon", group: "Finansial" },
    { label: "Penarikan Komisi Afiliasi", href: "/admin/afiliasi", group: "Finansial" },
    { label: "Direktori Siswa & Kontrol Perangkat", href: "/admin/siswa", group: "Sistem" },
    { label: "Pusat Pengaturan, Notifikasi & Gateway", href: "/admin/pengaturan", group: "Sistem" },
  ];

  const filteredLinks = quickLinks.filter((l) =>
    l.label.toLowerCase().includes(query.toLowerCase()) ||
    l.href.toLowerCase().includes(query.toLowerCase())
  );

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "ACADEMIC_ADMIN":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "TUTOR":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "FINANCE":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-canvas-dark/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      {/* Left: Dynamic Breadcrumb & Search */}
      <div className="flex items-center gap-4">
        {/* Breadcrumb Info */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400">
          <span className="font-medium text-slate-400">{pageMeta.group}</span>
          <ChevronRight className="w-3 h-3 text-slate-300 dark:text-white/20" />
          <span className="font-bold text-slate-800 dark:text-white">{pageMeta.title}</span>
        </div>

        <div className="hidden lg:block h-4 w-[1px] bg-slate-200 dark:bg-white/10" />

        {/* Quick Search Trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface-dark text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Cari modul atau perintah...</span>
          <span className="sm:hidden">Cari...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-400">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Switch to Student Portal */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all"
        >
          <span>Portal Siswa</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </Link>

        {/* Ticket Complaints Alert */}
        <Link
          href="/admin/laporan-soal"
          title="Tiket Keluhan Butir Soal"
          className="relative p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <Flag className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        </Link>

        {/* Admin Profile Pill */}
        {admin && (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-white/10">
            {/* Monogram Badge */}
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
              {admin.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </div>

            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {admin.name}
              </span>
              <span
                className={`mt-0.5 inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black tracking-wider uppercase border w-fit ${getRoleBadgeStyle(
                  admin.role
                )}`}
              >
                {admin.role.replace("_", " ")}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Keluar dari Panel Admin"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Search Modal (Cmd+K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="p-3.5 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari navigasi modul atau pengaturan..."
                autoFocus
                className="w-full text-xs bg-transparent focus:outline-none text-slate-900 dark:text-white"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10"
              >
                ESC
              </button>
            </div>

            <div className="p-2 max-h-64 overflow-y-auto space-y-1">
              {filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                      {link.group}
                    </span>
                    <span>{link.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{link.href}</span>
                </Link>
              ))}
              {filteredLinks.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  Tidak ada modul yang cocok dengan "{query}".
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
