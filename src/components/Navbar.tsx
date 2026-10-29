"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Compass,
  Trophy,
  User,
  LogOut,
  ShoppingBag,
  Menu,
  X,
  ChevronDown
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Never fetch member session on admin portal
    if (pathname.startsWith("/admin")) return;

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  // Completely hide member header on admin pages or active CAT exam screen
  if (
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/tryout/") && !pathname.includes("/discussion"))
  ) {
    return null;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Beranda", icon: Compass },
    { href: "/tryout", label: "Tryout CAT", icon: Trophy },
    { href: "/bimbel", label: "Kelas Bimbel", icon: BookOpen },
    { href: "/paket", label: "Paket & Harga", icon: ShoppingBag },
    { href: "/perkembangan-belajar", label: "Raport Belajar", icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-canvas-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/10 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-tight">
              LOLOS<span className="text-rose-600">KAMPUS</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              CBT KEDINASAN & CPNS
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`btn-interactive px-3.5 py-2 rounded-lg text-xs font-semibold ${
                  isActive
                    ? "bg-slate-100 dark:bg-surface-elevated text-rose-600 dark:text-rose-400"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 mr-1.5 opacity-80" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Account Section */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/akun"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <span>{user.profile?.fullName || user.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Keluar"
                className="btn-interactive p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="btn-interactive px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Masuk
              </Link>
              <Link
                href="/login?tab=register"
                className="btn-interactive px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-600/20"
              >
                Daftar Akun
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-white/10 bg-white dark:bg-canvas-dark px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive
                    ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5">
            {user ? (
              <div className="space-y-1">
                <Link
                  href="/akun"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  <User className="w-4 h-4" />
                  Profil & Afiliasi
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-rose-600 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar Akun
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-interactive w-full py-2.5 text-center text-sm font-semibold rounded-lg border border-slate-200 text-slate-800 dark:text-white"
                >
                  Masuk
                </Link>
                <Link
                  href="/login?tab=register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-interactive w-full py-2.5 text-center text-sm font-semibold text-white bg-rose-600 rounded-lg"
                >
                  Daftar Sekarang
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

