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
  ShieldCheck,
  Video,
  Target,
  BarChart3,
  BookmarkCheck,
  Zap,
  GraduationCap
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tryouts = await prisma.tryoutPackage.findMany({
    where: { isPublished: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { benefits: true },
    take: 3,
    orderBy: { price: "asc" },
  });

  const banners = await prisma.spotlightBanner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-canvas-dark">
      {/* =========================================================================
          HERO SECTION (Style UI: Dot Matrix Background + Radial Spotlight)
          ========================================================================= */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-slate-800/80">
        {/* Subtle Geometric Dot Grid Pattern */}
        <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />

        {/* Soft Radial Rose Vignette (Restrained focal point) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(225,29,72,0.18)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Col: Main Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Simulasi Resmi Standar PermenPAN-RB & BKN 2026</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                Raih Tiket Lolos Sekolah Kedinasan & CPNS{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-amber-300">
                  Dengan Skor 450+
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Uji kompetensi Anda melalui portal Computer Assisted Test (CAT) paling presisi di Indonesia. Dilengkapi 110 butir soal prediktif, timer real-time anti-joki, grafik radar kelemahan, dan kelas live bersama master tutor PKN STAN, STIS, & IPDN.
              </p>

              {/* Primary & Secondary CTAs (1-to-3 UX rule) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  href="/tryout"
                  className="btn-interactive px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Mulai Simulasi CAT Gratis
                </Link>
                <Link
                  href="/paket"
                  className="btn-interactive px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-sm font-semibold flex items-center justify-center gap-2 hover:border-slate-600"
                >
                  Lihat Paket & Harga
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Verified Trust Telemetry */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-xs">
                <div className="space-y-0.5">
                  <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums tracking-tight">110 Butir</div>
                  <div className="text-slate-400 font-medium">TWK, TIU, TKP BKN</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums tracking-tight">100 Menit</div>
                  <div className="text-slate-400 font-medium">Countdown Tiap Detik</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums tracking-tight">100%</div>
                  <div className="text-slate-400 font-medium">Passing Grade Resmi</div>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Live CAT Scorecard Preview */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-slate-900/90 border border-slate-700/80 p-6 shadow-2xl backdrop-blur-xl">
                {/* Micro Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-300 ml-1">Simulasi Skor CAT BKN</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    LIVE PREVIEW
                  </span>
                </div>

                {/* Simulated Subtest Progress Rows */}
                <div className="py-5 space-y-3.5 text-xs">
                  {/* TWK Row */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                          TWK
                        </span>
                        <span className="font-semibold text-slate-200">Tes Wawasan Kebangsaan</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">95 / 65 PG</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full w-[82%]" />
                    </div>
                  </div>

                  {/* TIU Row */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                          TIU
                        </span>
                        <span className="font-semibold text-slate-200">Tes Intelegensia Umum</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">135 / 80 PG</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-1.5 rounded-full w-[88%]" />
                    </div>
                  </div>

                  {/* TKP Row */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                          TKP
                        </span>
                        <span className="font-semibold text-slate-200">Karakteristik Pribadi</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">192 / 166 PG</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-emerald-400 h-1.5 rounded-full w-[94%]" />
                    </div>
                  </div>

                  {/* Total Result Pill */}
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-emerald-300 font-semibold">Total Nilai Kumulatif</div>
                      <div className="text-2xl font-black text-white tabular-nums tracking-tight">
                        422 <span className="text-xs text-slate-400 font-normal">/ 550 Max</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 uppercase tracking-wider shadow-sm">
                        LOLOS AMBANG BATAS
                      </span>
                      <div className="text-[10px] text-emerald-400 mt-1">Ranking 4 dari 1.840 Peserta</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Sesi Anti-Account Sharing
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Autosave Tiap Detik
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BENTO GRID: 4 PILAR KEUNGGULAN (Style UI Asymmetric Layout)
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30">
            <Zap className="w-3.5 h-3.5" />
            Fitur Unggulan LolosKampus
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Arsitektur Belajar Terstruktur Untuk Menjamin Kelulusan
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Bukan sekadar bank soal acak, sistem kami dirancang berdasarkan metodologi drill-and-practice dan diagnosis kelemahan spesifik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento Card 1: CAT Real-Time Engine (7 cols) */}
          <div className="md:col-span-7 bento-card flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center text-rose-600">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Simulasi CAT BKN 100 Menit Persis Ujian Asli
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Antarmuka ujian dirancang 1:1 menyerupai portal resmi BKN dengan matriks 110 nomor soal, penanda ragu-ragu, timer countdown presisi, dan perhitungan skor TKP bertingkat (1-5 poin).
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 font-semibold text-slate-700 dark:text-slate-300">
                30 Butir TWK
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 font-semibold text-slate-700 dark:text-slate-300">
                35 Butir TIU
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 font-semibold text-slate-700 dark:text-slate-300">
                45 Butir TKP
              </span>
              <span className="ml-auto text-rose-600 font-bold flex items-center gap-1">
                Passing Grade Otomatis <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Bento Card 2: Mistake Notebook (5 cols) */}
          <div className="md:col-span-5 bento-card flex flex-col justify-between bg-gradient-to-br from-white to-slate-50 dark:from-surface-dark dark:to-canvas-dark">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center justify-center text-amber-600">
                <BookmarkCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Mistake Notebook Otomatis
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Setiap butir soal yang salah atau Anda ragu saat ujian otomatis terkumpul di buku catatan evaluasi. Pelajari pembahasan mendalam tanpa harus membuka ulang seluruh 110 butir soal.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-bold">
                <span>Filter Per Subtes & Tingkat Kesulitan</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Bento Card 3: Radar Kompetensi 14 Dimensi (5 cols) */}
          <div className="md:col-span-5 bento-card flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 flex items-center justify-center text-blue-600">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Analisis Radar Kelemahan Materi
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Ketahui topik mana yang paling sering membuat Anda gagal. Sistem memetakan penguasaan materi Pancasila, Silogisme, Figural, hingga Anti-Radikalisme.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Akurasi Prediksi</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">98.4% Berdasarkan Data Ujian</span>
            </div>
          </div>

          {/* Bento Card 4: Live Zoom Classes & Presensi (7 cols) */}
          <div className="md:col-span-7 bento-card flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 flex items-center justify-center text-purple-600">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Kelas Bimbel Live Zoom & Rekaman Materi 24/7
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Tatap muka langsung dengan master tutor alumni STAN, STIS, dan ASN berprestasi. Akses rekaman kelas resolusi tinggi, modul PDF eksklusif, dan presensi otomatis satu klik.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-500">Jadwal Teratur Setiap Pekan</span>
              <Link href="/bimbel" className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline">
                Lihat Jadwal Kelas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TRYOUT PACKAGES SHOWCASE (Style UI Card Matrix)
          ========================================================================= */}
      <section className="py-16 bg-white dark:bg-canvas-dark border-y border-slate-200/80 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
                Latihan Mandiri
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Paket Tryout CAT BKN Terbaru
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Pilih paket simulasi dan langsung kerjakan di browser Anda tanpa perlu install aplikasi.
              </p>
            </div>
            <Link
              href="/tryout"
              className="btn-interactive px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Lihat Seluruh Paket ({tryouts.length}+) <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tryouts.map((to) => (
              <div
                key={to.id}
                className="bento-card flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-rose-600" />
                      {to.durationMinutes} Menit • {to.totalQuestions} Soal
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      Standar 2026
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-rose-600 transition-colors">
                    {to.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed line-clamp-2">
                    {to.description || "Ujian simulasi lengkap standar BKN dengan passing grade resmi."}
                  </p>

                  {/* Passing Grade Criteria Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Passing Grade TWK:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{to.passingGradeTwk} Poin</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Passing Grade TIU:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{to.passingGradeTiu} Poin</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Passing Grade TKP:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{to.passingGradeTkp} Poin</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/tryout/${to.id}`}
                  className="btn-interactive w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-700 text-white text-xs font-bold text-center shadow-sm"
                >
                  Kerjakan Tryout Sekarang
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRICING & BIMBEL PACKAGES (Style UI 3-Tier Card Layout)
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30">
            <Sparkles className="w-3.5 h-3.5" />
            Investasi Menembus Kampus Impian
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pilih Paket Bimbingan Belajar & Tryout
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Semua paket mendukung pembayaran instan via Dynamic QRIS (BCA, Mandiri, BRI, GoPay, Dana, ShopeePay) dengan konfirmasi otomatis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {products.map((product) => {
            const isFeatured = product.category === "bundling";
            return (
              <div
                key={product.id}
                className={`bento-card flex flex-col justify-between relative ${
                  isFeatured
                    ? "border-2 border-rose-600 dark:border-rose-500 shadow-xl md:-translate-y-2"
                    : ""
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black tracking-wider uppercase shadow-md shadow-rose-600/30">
                    PILIHAN TERBAIK & PALING HEMAT
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {product.category === "tryout"
                      ? "Tryout Mandiri"
                      : product.category === "bimbel"
                      ? "Bimbel Intensif"
                      : "Paket Lengkap Super"}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mb-6 pb-6 border-b border-slate-100 dark:border-white/5">
                    <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Akses penuh periode {product.periodText || "2026"}</div>
                  </div>

                  {/* Benefit Checklist */}
                  <div className="space-y-2.5 mb-8 text-xs">
                    {product.benefits?.slice(0, 5).map((b) => (
                      <div key={b.id} className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{(b as any).benefitText || (b as any).text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/checkout?productId=${product.id}`}
                  className={`btn-interactive w-full py-3 rounded-xl text-xs font-bold text-center shadow-md ${
                    isFeatured
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25"
                      : "bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 text-white"
                  }`}
                >
                  Ambil Paket Ini Sekarang
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-canvas-dark py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-rose-600 flex items-center justify-center text-white font-bold text-xs">
              LK
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white">LOLOSKAMPUS EDTECH</span>
              <p className="text-[11px] text-slate-400">© 2026 Portal Persiapan Seleksi Masuk Kedinasan & CPNS. Seluruh hak cipta dilindungi.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-semibold">
            <Link href="/tryout" className="hover:text-slate-900 dark:hover:text-white transition-colors">Tryout CAT</Link>
            <Link href="/bimbel" className="hover:text-slate-900 dark:hover:text-white transition-colors">Kelas Bimbel</Link>
            <Link href="/paket" className="hover:text-slate-900 dark:hover:text-white transition-colors">Paket & Harga</Link>
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">Masuk Siswa</Link>
            <Link href="/admin" className="hover:text-rose-600 transition-colors">Portal Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
