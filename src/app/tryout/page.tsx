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
  AlertCircle,
  Sparkles,
  BarChart3,
  Layers
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
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 mb-2.5">
            <Trophy className="w-3.5 h-3.5" />
            Computer Assisted Test (CAT) BKN 2026
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Katalog Tryout SKD Kedinasan & CPNS
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Simulasi CAT BKN berbasis waktu nyata 100 menit dengan 110 butir soal prediktif (TWK 65, TIU 80, TKP 166). Selesaikan tryout untuk membuka ranking nasional dan evaluasi kelemahan materi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/perkembangan-belajar"
            className="btn-interactive px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 shadow-subtle"
          >
            <BarChart3 className="w-3.5 h-3.5 mr-1 text-rose-600" />
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

          const isTwkPassed = latestSession ? latestSession.scoreTwk >= pkg.passingGradeTwk : false;
          const isTiuPassed = latestSession ? latestSession.scoreTiu >= pkg.passingGradeTiu : false;
          const isTkpPassed = latestSession ? latestSession.scoreTkp >= pkg.passingGradeTkp : false;

          return (
            <div
              key={pkg.id}
              className="bento-card flex flex-col justify-between group"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                    {pkg.durationMinutes} Menit • {pkg.totalQuestions} Soal
                  </span>

                  {hasCompleted && (
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        latestSession.isPassed
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20"
                      }`}
                    >
                      {latestSession.isPassed ? "✓ LOLOS PG" : "✗ TIDAK LOLOS"}
                    </span>
                  )}
                  {isOngoing && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 animate-pulse">
                      ● SEDANG BERLANGSUNG
                    </span>
                  )}
                </div>

                {/* Subtest Composition Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                    TWK (30)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                    TIU (35)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                    TKP (45)
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-rose-600 transition-colors">
                  {pkg.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                  {pkg.description || "Simulasi lengkap dengan analisis radar kompetensi dan pembahasan tuntas."}
                </p>

                {/* Score breakdown if completed */}
                {hasCompleted ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-2 text-xs mb-6">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Skor Akhir Siswa:</span>
                      <b className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                        {latestSession.totalScore} <span className="text-xs text-slate-400 font-normal">/ 550</span>
                      </b>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-200 dark:border-white/5 text-[11px] font-mono text-center">
                      <div className={`p-1 rounded ${isTwkPassed ? "bg-emerald-500/10 text-emerald-600 font-bold" : "bg-rose-500/10 text-rose-600"}`}>
                        TWK: {latestSession.scoreTwk}
                      </div>
                      <div className={`p-1 rounded ${isTiuPassed ? "bg-emerald-500/10 text-emerald-600 font-bold" : "bg-rose-500/10 text-rose-600"}`}>
                        TIU: {latestSession.scoreTiu}
                      </div>
                      <div className={`p-1 rounded ${isTkpPassed ? "bg-emerald-500/10 text-emerald-600 font-bold" : "bg-rose-500/10 text-rose-600"}`}>
                        TKP: {latestSession.scoreTkp}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Passing Grade TWK:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{pkg.passingGradeTwk} Poin</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Passing Grade TIU:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{pkg.passingGradeTiu} Poin</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Passing Grade TKP:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{pkg.passingGradeTkp} Poin</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                {hasCompleted ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/tryout/${pkg.id}/discussion`}
                      className="btn-interactive py-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold text-slate-800 dark:text-slate-200 text-center"
                    >
                      <BookOpenCheck className="w-3.5 h-3.5 mr-1" />
                      Pembahasan
                    </Link>
                    <Link
                      href={`/tryout/${pkg.id}`}
                      className="btn-interactive py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold text-center shadow-sm"
                    >
                      Ulangi Tryout
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={`/tryout/${pkg.id}`}
                    className={`btn-interactive w-full py-2.5 rounded-xl text-xs font-bold text-center shadow-sm ${
                      isOngoing
                        ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
                        : "bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-700 text-white shadow-slate-900/10"
                    }`}
                  >
                    {isOngoing ? "Lanjutkan Ujian CAT" : "Mulai Simulasi CAT"}
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
