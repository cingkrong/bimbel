import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import {
  Check,
  Sparkles,
  Trophy,
  Video,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  HelpCircle,
  FileCheck2,
  Gift,
  CheckCircle2,
  Smartphone
} from "lucide-react";
import { TrackViewContent } from "@/components/analytics/TrackViewContent";

export const dynamic = "force-dynamic";

export default async function PricingPackagesPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      benefits: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { price: "asc" },
  });

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-canvas-dark text-slate-900 dark:text-slate-100 overflow-hidden">
      <TrackViewContent
        contentName="Katalog Paket Bimbel & Tryout 2026"
        value={Number(products[0]?.price || 99000)}
      />
      {/* Background Dot Matrix & Spotlight */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40 dark:opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-rose-500/10 dark:bg-rose-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Investasi Kelulusan Sekolah Kedinasan & CPNS 2026
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Pilih Paket Persiapan Terbaik, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
              Raih NIP Impianmu
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Dapatkan akses simulasi CAT BKN teruji dengan sistem scoring analitis, kelas bimbingan live Zoom interaktif bersama Master Tutor, dan Mistake Notebook terstruktur.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
          {products.map((product) => {
            const isFeatured = product.category === "bundling";

            return (
              <div
                key={product.id}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 relative ${
                  isFeatured
                    ? "border-2 border-rose-600 bg-white dark:bg-surface-dark shadow-2xl scale-100 md:scale-105 z-10 ring-4 ring-rose-500/10"
                    : "border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-white/20"
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 text-white text-[11px] font-black tracking-wider uppercase shadow-md shadow-rose-600/30 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" />
                    Paling Diminati & Hemat
                  </div>
                )}

                <div>
                  {/* Category Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-md">
                      {product.category === "tryout"
                        ? "Tryout Mandiri"
                        : product.category === "bimbel"
                        ? "Bimbel Intensif"
                        : "Paket Komplit Super"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Akses {product.periodText || "2026"}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 leading-snug">
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 min-h-[3rem] leading-relaxed">
                    {product.description}
                  </p>

                  {/* Price Tag */}
                  <div className="mb-6 pb-6 border-b border-slate-100 dark:border-white/5">
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                      {formatRupiah(Number(product.price))}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Satu kali bayar untuk periode seleksi 2026</span>
                    </div>
                  </div>

                  {/* Benefits List */}
                  <div className="space-y-3.5 mb-8">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Fitur & Hak Akses:
                    </div>
                    {product.benefits.map((benefit) => (
                      <div key={benefit.id} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                        <span className="leading-snug">{benefit.benefitText}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Checkout CTA */}
                <Link
                  href={`/checkout?productId=${product.id}`}
                  className={`btn-interactive w-full py-3.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm ${
                    isFeatured
                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 font-extrabold"
                      : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900"
                  }`}
                >
                  Ambil Paket Ini
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Coupon & Guarantee Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Coupon Banner */}
          <div className="md:col-span-2 p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-rose-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-1.5 text-center sm:text-left z-10">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
                <Gift className="w-4 h-4" /> Promo Terbatas
              </div>
              <div className="font-extrabold text-lg">Punya Voucher Diskon?</div>
              <p className="text-xs text-slate-400 max-w-md">
                Gunakan kode <span className="bg-rose-600/30 text-rose-300 px-2 py-0.5 rounded font-mono font-bold">LOLOS2026</span> saat checkout untuk diskon langsung Rp 20.000 pada paket pilihan Anda.
              </p>
            </div>
            <Link
              href="/checkout?productId=prod-to-01"
              className="btn-interactive px-5 py-3 rounded-xl bg-white text-slate-900 text-xs font-bold whitespace-nowrap hover:bg-slate-100 z-10 flex-shrink-0"
            >
              Klaim Voucher Sekarang
            </Link>
          </div>

          {/* Guarantee Pill */}
          <div className="p-6 rounded-3xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-white/10 shadow-sm flex flex-col justify-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">Garansi Kepuasan</div>
                <div className="text-[11px] text-slate-500">100% Kisi-kisi Resmi BKN</div>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Materi dan bank soal disusun langsung berdasarkan Keputusan MenPAN-RB terbaru nomor 651 tahun 2023.
            </p>
          </div>
        </div>

        {/* Trust Badges 4-Grid */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-white/10">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Kenapa 10.000+ Calon Praja Memilih LolosKampus?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Simulasi CAT Standar BKN</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Durasi 100 menit, 110 butir soal, passing grade TWK 65, TIU 80, TKP 166 dengan bobot nilai presisi.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Live Zoom Bersama Alumni</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Bedah trik cepat hitung pecahan TIU, silogisme analogi, dan penalaran pilar kebangsaan TWK.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Mistake Notebook Otomatis</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Soal salah langsung dihimpun dalam buku catatan kesalahan untuk diulang hingga benar-benar paham.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-white/10 shadow-sm space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Akses Multi-Device</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dapat diakses lancar melalui Laptop, Tablet, maupun Smartphone dengan antarmuka responsif tanpa lag.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6 pt-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-xs text-slate-500">
              Semua yang perlu Anda ketahui tentang aktivasi paket dan sistem belajar kami.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-white/10 shadow-sm space-y-1.5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                Kapan paket saya aktif setelah pembayaran?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                Pembayaran via QRIS terverifikasi secara otomatis instan dalam 5-15 detik. Paket Anda langsung aktif seketika setelah scan berhasil.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-white/10 shadow-sm space-y-1.5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                Berapa kali saya bisa mengulang tryout yang sudah dibeli?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                Seluruh paket memberikan akses unlimited untuk mengerjakan ulang simulasi dan melihat arsip pembahasan lengkap beserta catatan kesalahan.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-white/10 shadow-sm space-y-1.5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                Bagaimana jika saya berhalangan hadir saat sesi Live Zoom?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                Jangan khawatir! Seluruh sesi live Zoom direkam dalam resolusi Full HD 1080p dan diunggah ke LMS akun Anda maksimal 2 jam setelah kelas selesai.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
