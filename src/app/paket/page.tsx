import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import { Check, Sparkles, Trophy, Video, Layers, ArrowRight } from "lucide-react";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30">
          <Sparkles className="w-3.5 h-3.5" />
          Pilihan Paket Investasi Belajar 2026
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pilih Paket Persiapan Masuk PKN STAN, STIS & CPNS
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Akses simulasi CAT BKN teruji dan kelas bimbingan belajar intensif dengan kurikulum terlengkap di Indonesia.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {products.map((product) => {
          const isFeatured = product.category === "bundling";

          return (
            <div
              key={product.id}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 relative ${
                isFeatured
                  ? "border-2 border-rose-600 bg-white dark:bg-surface-dark shadow-xl scale-105 z-10"
                  : "border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm hover:shadow-md"
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-rose-600 text-white text-[11px] font-black tracking-wider uppercase shadow-md shadow-rose-600/30">
                  REKOMENDASI TERBAIK
                </div>
              )}

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {product.category === "tryout"
                    ? "Tryout SKD Mandiri"
                    : product.category === "bimbel"
                    ? "Bimbel Intensif"
                    : "Paket Lengkap Super"}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {product.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 min-h-[3rem] leading-relaxed">
                  {product.description}
                </p>

                <div className="mb-6 pb-6 border-b border-slate-100 dark:border-white/5">
                  <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                    {formatRupiah(Number(product.price))}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Akses penuh periode {product.periodText || "2026"}</div>
                </div>

                {/* Benefits List */}
                <div className="space-y-3 mb-8">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Fasilitas yang didapatkan:
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

              <Link
                href={`/checkout?productId=${product.id}`}
                className={`btn-interactive w-full py-3.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm ${
                  isFeatured
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25"
                    : "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900"
                }`}
              >
                Beli Paket Ini Sekarang
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Coupon banner */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto shadow-lg">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-extrabold text-base">Punya Kode Promo / Voucher?</div>
          <div className="text-xs text-slate-400">
            Gunakan kode kupon <code className="bg-rose-600/30 text-rose-300 px-2 py-0.5 rounded font-mono font-bold">LOLOS2026</code> untuk potongan langsung Rp 20.000 pada saat checkout!
          </div>
        </div>
        <Link
          href="/checkout?productId=prod-to-01"
          className="btn-interactive px-5 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold whitespace-nowrap hover:bg-slate-100"
        >
          Klaim Voucher
        </Link>
      </div>
    </div>
  );
}

