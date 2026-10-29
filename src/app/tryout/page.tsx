import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  BookOpenCheck,
  AlertCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TryoutCatalogPage() {
  const user = await getCurrentUser();

  const packages = await prisma.tryoutPackage.findMany({
    where: { isPublished: true },
    include: {
      sessions: user
        ? {
            where: { userId: user.id },
            orderBy: { startedAt: "desc" },
            take: 1,
          }
        : false,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/40 mb-2">
            <Trophy className="w-3.5 h-3.5" />
            Computer Assisted Test (CAT) BKN
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Simulasi Tryout SKD Kedinasan & CPNS 2026
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Sistem simulasi akurat berbasis waktu nyata 100 menit dengan 110 butir soal lengkap (TWK, TIU, TKP) berstandar BKN resmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/perkembangan-belajar"
            className="btn-interactive px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            Lihat Raport Belajar
          </Link>
        </div>
      </div>

      {/* Tryout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const latestSession = pkg.sessions?.[0];
          const hasCompleted = latestSession?.isCompleted;
          const isOngoing = latestSession && !latestSession.isCompleted;

          return (
            <div
              key={pkg.id}
              className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-md">
                    <Clock className="w-3 h-3 text-rose-600" />
                    {pkg.durationMinutes} Menit • {pkg.totalQuestions} Soal
                  </span>

                  {hasCompleted && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        latestSession.isPassed
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {latestSession.isPassed ? "LOLOS PG" : "TIDAK LOLOS"}
                    </span>
                  )}
                  {isOngoing && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">
                      SEDANG BERLANGSUNG
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 leading-snug">
                  {pkg.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                  {pkg.description || "Simulasi lengkap dengan analisis radar kompetensi dan pembahasan tuntas."}
                </p>

                {/* Score breakdown if completed */}
                {hasCompleted ? (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-1.5 text-xs mb-6">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Total Skor Diperoleh:</span>
                      <b className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                        {latestSession.totalScore} / 550
                      </b>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-white/5">
                      <span>TWK: {latestSession.scoreTwk} (PG: {pkg.passingGradeTwk})</span>
                      <span>TIU: {latestSession.scoreTiu} (PG: {pkg.passingGradeTiu})</span>
                      <span>TKP: {latestSession.scoreTkp} (PG: {pkg.passingGradeTkp})</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-1 text-xs text-slate-600 dark:text-slate-300 mb-6">
                    <div className="flex justify-between">
                      <span>Passing Grade TWK:</span> <b className="text-slate-900 dark:text-white">{pkg.passingGradeTwk}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Passing Grade TIU:</span> <b className="text-slate-900 dark:text-white">{pkg.passingGradeTiu}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Passing Grade TKP:</span> <b className="text-slate-900 dark:text-white">{pkg.passingGradeTkp}</b>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {hasCompleted ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/tryout/${pkg.id}/discussion`}
                      className="btn-interactive py-2.5 rounded-lg border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold text-slate-800 dark:text-slate-200 text-center"
                    >
                      <BookOpenCheck className="w-3.5 h-3.5 mr-1" />
                      Pembahasan
                    </Link>
                    <Link
                      href={`/tryout/${pkg.id}`}
                      className="btn-interactive py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold text-center"
                    >
                      Ulangi Ujian
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={`/tryout/${pkg.id}`}
                    className={`btn-interactive w-full py-2.5 rounded-lg text-xs font-bold text-center ${
                      isOngoing
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : "bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-700 text-white"
                    }`}
                  >
                    {isOngoing ? "Lanjutkan Ujian CAT" : "Mulai Simulasi CAT"}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

