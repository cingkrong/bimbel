"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, BookOpen, BarChart3, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide bottom navigation when inside admin portal or active exam page (/tryout/[id])
  if (
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/tryout/") && !pathname.includes("/discussion"))
  ) {
    return null;
  }

  const tabs = [
    { href: "/", label: "Beranda", icon: Home },
    { href: "/tryout", label: "Tryout", icon: Trophy },
    { href: "/bimbel", label: "Bimbel", icon: BookOpen },
    { href: "/perkembangan-belajar", label: "Raport", icon: BarChart3 },
    { href: "/akun", label: "Akun", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-canvas-dark/95 backdrop-blur-lg border-t border-slate-200 dark:border-white/10 px-2 py-1.5 safe-area-bottom shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-140 ${
                isActive
                  ? "text-rose-600 dark:text-rose-400 font-bold scale-105"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-[1.75px]"}`} />
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

