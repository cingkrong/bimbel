"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, ShieldCheck, CheckCircle2, Heart } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Hide footer on admin pages or active CAT exam screens
  if (
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/tryout/") && !pathname.includes("/discussion"))
  ) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-canvas-dark/70 backdrop-blur-md mt-auto pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                Lolos<span className="text-rose-600">Kampus</span>
              </span>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Platform persiapan seleksi masuk Sekolah Kedinasan dan CPNS teruji. Dilengkapi mesin CAT BKN standar resmi, analisa kompetensi 14 subtes, dan kelas bimbingan live interaktif.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistem CAT Siap Ujian (v2.6)
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Navigasi Belajar
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/tryout" className="hover:text-rose-600 transition-colors">
                  Katalog Tryout Mandiri
                </Link>
              </li>
              <li>
                <Link href="/bimbel" className="hover:text-rose-600 transition-colors">
                  Kelas Bimbel Live Zoom
                </Link>
              </li>
              <li>
                <Link href="/perkembangan-belajar" className="hover:text-rose-600 transition-colors">
                  Raport & Mistake Notebook
                </Link>
              </li>
              <li>
                <Link href="/paket" className="hover:text-rose-600 transition-colors">
                  Pilihan Paket Investasi
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-rose-600 transition-colors">
                  Portal Masuk Siswa
                </Link>
              </li>
            </ul>
          </div>

          {/* Target Seleksi */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Target Seleksi 2026
            </div>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>PKN STAN (Politeknik Keuangan Negara)</li>
              <li>Polstat STIS (Statistika Terapan)</li>
              <li>IPDN (Institut Pemerintahan Dalam Negeri)</li>
              <li>Poltekip & Poltekim (Kemenkumham)</li>
              <li>STIN & Sekolah Kedinasan Kemenhub</li>
              <li>Seleksi CPNS Formasi Pusat & Daerah</li>
            </ul>
          </div>

          {/* Keamanan & Trust */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Standar & Keamanan
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dilengkapi perlindungan sesi tunggal (Single Device Session Lock) serta integrasi QRIS Bank Indonesia instan 24 jam.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Sesuai Kisi-kisi BKN 2023-2026</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} LolosKampus EdTech. Seluruh Hak Cipta Dilindungi Undang-Undang.
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Didesain dengan presisi untuk kelulusan praja</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
