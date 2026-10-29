import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Trophy,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Users,
  ShieldCheck
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tryouts = await prisma.tryoutPackage.findMany({
    where: { isPublished: true },
    take: 3,
  });

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { benefits: true },
    take: 3,
  });

  const banners = await prisma.spotlightBanner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulasi Resmi Standar PermenPAN-RB & BKN 2026</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Lolos Tes Kedinasan <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-amber-400">
                  PKN STAN, STIS, & CPNS
                </span>{" "}
                Dengan Skor Maksimal.
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Uji kemampuan Anda melalui portal Computer Assisted Test (CAT) tercepat di Indonesia. Dilengkapi 110 butir soal prediktif, analisis radar kelemahan kompetensi, dan kelas bimbel intensif bersama master tutor.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/tryout"
                  className="btn-interactive px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Mulai Simulasi CAT Gratis
                </Link>
                <Link
                  href="/paket"
                  className="btn-interactive px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  Lihat Paket & Harga
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800">
                <div>
                  <div className="text-2xl font-bold text-white tabular-nums">110 Soal</div>
                  <div className="text-xs text-slate-400">TWK, TIU, TKP BKN</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white tabular-nums">100 Menit</div>
                  <div className="text-xs text-slate-400">Timer Real-Time CAT</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white tabular-nums">98.4%</div>
                  <div className="text-xs text-slate-400">Akurasi Soal Prediksi</div>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">CAT BKN ENGINE v2.6</span>
                </div>

                <div className="py-5 space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-slate-400">Passing Grade TWK</div>
                      <div className="text-lg font-bold text-white tabular-nums">65 Poin (Target 100+)</div>
                    </div>
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      LOLOS
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-slate-400">Passing Grade TIU</div>
                      <div className="text-lg font-bold text-white tabular-nums">80 Poin (Target 130+)</div>
                    </div>
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      LOLOS
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-slate-400">Passing Grade TKP</div>
                      <div className="text-lg font-bold text-white tabular-nums">166 Poin (Target 200+)</div>
                    </div>
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      LOLOS
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-400" /> Single-Device Protection
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" /> Autosave Tiap Detik
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tryout Packages Showcase */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
              Simulasi Mandiri
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Paket Tryout CAT BKN Terbaru
            </h2>
          </div>
          <Link
            href="/tryout"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            Lihat Semua Tryout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tryouts.map((to) => (
            <div
              key={to.id}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 mb-4">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  {to.durationMinutes} Menit • {to.totalQuestions} Soal
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {to.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                  {to.description || "Ujian simulasi lengkap standar BKN dengan passing grade resmi."}
                </p>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 mb-6">
                  <div className="flex justify-between">
                    <span>Passing Grade TWK:</span> <b className="text-slate-900 dark:text-white">{to.passingGradeTwk}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing Grade TIU:</span> <b className="text-slate-900 dark:text-white">{to.passingGradeTiu}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing Grade TKP:</span> <b className="text-slate-900 dark:text-white">{to.passingGradeTkp}</b>
                  </div>
                </div>
              </div>

              <Link
                href={`/tryout/${to.id}`}
                className="btn-interactive w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-700 text-white text-xs font-bold text-center"
              >
                Kerjakan Tryout Sekarang
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Analytics Highlight */}
      <section className="bg-slate-100 dark:bg-surface-dark/50 py-16 border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Fitur Analisis Cerdas
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Pahami Kelemahan Anda Sebelum Ujian Sebenarnya.
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Platform LolosKampus secara otomatis memetakan jawaban Anda ke dalam 14 kompetensi inti SKD (Pancasila, Integritas, Analogi, Silogisme, hingga Anti-Radikalisme). Soal yang salah langsung tersimpan di <b>Mistake Notebook</b> untuk Anda pelajari ulang sampai tuntas.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Grafik Radar Kompetensi Multidimensi per Subtes</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Mistake Notebook: Drill-down soal salah dengan pembahasan lengkap</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Progress Skor Historis dan Prediksi Kelulusan Passing Grade</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/perkembangan-belajar"
                  className="btn-interactive px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Buka Raport & Analisis Saya
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-canvas-dark p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Radar Kompetensi SKD Kedinasan
                  </div>
                  <span className="text-[11px] font-semibold text-rose-600">Akurasi 88%</span>
                </div>
                <div className="py-6 flex items-center justify-center text-center">
                  <div className="space-y-2">
                    <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 mx-auto flex items-center justify-center text-rose-600 dark:text-rose-400">
                      <TrendingUp className="w-10 h-10" />
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      14 Dimensi Kompetensi Terpantau
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                      Grafik radar interaktif menyajikan evaluasi detail performa Nasionalisme, Silogisme, hingga Pelayanan Publik.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-canvas-dark py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white">LOLOSKAMPUS</span>
            <span>© 2026 Portal Persiapan Seleksi Masuk Kedinasan & CPNS. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tryout" className="hover:text-slate-900 dark:hover:text-white">Tryout CAT</Link>
            <Link href="/bimbel" className="hover:text-slate-900 dark:hover:text-white">Kelas Bimbel</Link>
            <Link href="/paket" className="hover:text-slate-900 dark:hover:text-white">Paket & Harga</Link>
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white">Masuk Siswa</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

