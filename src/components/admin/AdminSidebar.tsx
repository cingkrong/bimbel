"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Trophy,
  Video,
  Flag,
  CreditCard,
  Tag,
  Share2,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  GraduationCap
} from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
  } | null;
}

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // If on admin login page, don't show sidebar
  if (pathname === "/admin/login") return null;

  const role = admin?.role || "ACADEMIC_ADMIN";

  const navGroups = [
    {
      label: "Utama",
      items: [
        { href: "/admin", label: "Ringkasan Eksekutif", icon: LayoutDashboard, roles: ["SUPERADMIN", "ACADEMIC_ADMIN", "FINANCE"] },
      ],
    },
    {
      label: "Akademik & CAT BKN",
      items: [
        { href: "/admin/bank-soal", label: "Master Bank Soal", icon: Database, roles: ["SUPERADMIN", "ACADEMIC_ADMIN", "TUTOR"] },
        { href: "/admin/tryout", label: "Paket & Leaderboard", icon: Trophy, roles: ["SUPERADMIN", "ACADEMIC_ADMIN", "TUTOR"] },
        { href: "/admin/laporan-soal", label: "Moderasi Laporan", icon: Flag, roles: ["SUPERADMIN", "ACADEMIC_ADMIN", "TUTOR"] },
      ],
    },
    {
      label: "Bimbel & LMS",
      items: [
        { href: "/admin/bimbel", label: "Kelas, Zoom & Tugas", icon: Video, roles: ["SUPERADMIN", "ACADEMIC_ADMIN", "TUTOR"] },
      ],
    },
    {
      label: "Finansial & Toko",
      items: [
        { href: "/admin/transaksi", label: "Monitoring Transaksi", icon: CreditCard, roles: ["SUPERADMIN", "FINANCE"] },
        { href: "/admin/kupon", label: "Kupon Diskon", icon: Tag, roles: ["SUPERADMIN", "FINANCE"] },
        { href: "/admin/afiliasi", label: "Komisi Afiliasi", icon: Share2, roles: ["SUPERADMIN", "FINANCE"] },
      ],
    },
    {
      label: "Operasional & Sistem",
      items: [
        { href: "/admin/siswa", label: "Direktori & Sesi Siswa", icon: Users, roles: ["SUPERADMIN", "ACADEMIC_ADMIN", "FINANCE"] },
        { href: "/admin/pengaturan", label: "CMS Banner & Pengaturan", icon: Settings, roles: ["SUPERADMIN", "ACADEMIC_ADMIN"] },
      ],
    },
  ];

  const getRoleBadgeColor = (r: string) => {
    switch (r) {
      case "SUPERADMIN":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "ACADEMIC_ADMIN":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "TUTOR":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "FINANCE":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <aside
      className={`relative border-r border-slate-200 dark:border-white/10 bg-white dark:bg-canvas-dark flex flex-col justify-between transition-all duration-200 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-200 dark:border-white/10 px-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-rose-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-tight">
                  LOLOS<span className="text-rose-600">KAMPUS</span>
                </span>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  OPERATIONS HUB
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Badge Card */}
        {!collapsed && admin && (
          <div className="p-3 mx-3 my-3 rounded-xl bg-slate-50 dark:bg-surface-elevated border border-slate-200 dark:border-white/5 space-y-1">
            <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
              {admin.name}
            </div>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getRoleBadgeColor(
                admin.role
              )}`}
            >
              {admin.role.replace("_", " ")}
            </span>
          </div>
        )}

        {/* Navigation Group Items */}
        <div className="p-2 space-y-5 overflow-y-auto max-h-[calc(100vh-160px)]">
          {navGroups.map((group) => {
            const allowedItems = group.items.filter((item) => item.roles.includes(role));
            if (allowedItems.length === 0) return null;

            return (
              <div key={group.label} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {group.label}
                  </div>
                )}
                {allowedItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-slate-900 text-white dark:bg-rose-600 shadow-sm"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "opacity-75"}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400 flex items-center justify-between">
          <span>CAT Engine v2.6 Ops</span>
          <span className="flex items-center gap-1 font-mono text-emerald-500 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        </div>
      )}
    </aside>
  );
}

