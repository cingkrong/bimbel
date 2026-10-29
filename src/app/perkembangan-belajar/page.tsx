"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  Trophy,
  Target,
  Zap,
  TrendingUp,
  Flame,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  FileText,
  Loader2,
  ArrowRight
} from "lucide-react";

export default function LearningAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"RADAR" | "MISTAKES">("RADAR");

  useEffect(() => {
    async function loadData() {
      try {
        const [resAnalytics, resMistakes] = await Promise.all([
          fetch("/api/analytics/competency"),
          fetch("/api/analytics/mistakes"),
        ]);

        if (resAnalytics.ok) {
          const json = await resAnalytics.json();
          setData(json);
        }
        if (resMistakes.ok) {
          const jsonMistakes = await resMistakes.json();
          setMistakes(jsonMistakes.mistakes || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleMistakeReviewed = async (mistakeId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/analytics/mistakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mistakeId, isReviewed: !currentStatus }),
      });

      if (res.ok) {
        setMistakes((prev) =>
          prev.map((m) => (m.id === mistakeId ? { ...m, isReviewed: !currentStatus } : m))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalTryouts: 0,
    highestScore: 0,
    avgScore: 0,
    passingRate: 0,
    mistakeCount: 0,
    studyStreakDays: 7,
  };

  const progressionData = data?.progressionData || [];
  const radarData = data?.radarData || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/40 mb-2">
            <Target className="w-3.5 h-3.5" />
            LolosKampus Learning Telemetry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Raport Perkembangan Belajar Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Pantau progres skor simulasi CAT BKN, perbandingan radar kompetensi 14 subtes, dan kelola daftar kelemahan pada Mistake Notebook.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-surface-elevated p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("RADAR")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "RADAR"
                ? "bg-white dark:bg-rose-600 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            Radar Kompetensi & Skor
          </button>
          <button
            onClick={() => setActiveTab("MISTAKES")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "MISTAKES"
                ? "bg-white dark:bg-rose-600 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <span>Mistake Notebook</span>
            {mistakes.filter((m) => !m.isReviewed).length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {mistakes.filter((m) => !m.isReviewed).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-rose-600" />
            Total Tryout
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {metrics.totalTryouts} Sesi
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Skor Tertinggi
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {metrics.highestScore} <span className="text-xs font-normal text-slate-400">/ 550</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            Rata-rata Skor
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {metrics.avgScore}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            Kelulusan PG
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {metrics.passingRate}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            Study Streak
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {metrics.studyStreakDays} Hari
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-purple-500" />
            Perlu Review
          </div>
          <div className="text-2xl font-black text-rose-600 tabular-nums">
            {mistakes.filter((m) => !m.isReviewed).length} Soal
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "RADAR" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Radar Chart (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Radar Kompetensi 14 Subtes SKD
                </h3>
                <p className="text-[11px] text-slate-500">
                  Perbandingan performa penguasaan materi Anda vs Benchmark Nasional
                </p>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded">
                Target Stanford/BKN: ≥80
              </span>
            </div>

            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#94a3b8" strokeDasharray="3 3" opacity={0.3} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" opacity={0.2} />
                  <Radar
                    name="Skor Penguasaan Anda"
                    dataKey="userScore"
                    stroke="#e11d48"
                    fill="#e11d48"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Benchmark Lolos STAN"
                    dataKey="benchmark"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.15}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progression Line Chart (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-white/5">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Tren Progres Skor Historis
              </h3>
              <p className="text-[11px] text-slate-500">
                Peningkatan performa dari sesi ke sesi
              </p>
            </div>

            {progressionData.length > 0 ? (
              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressionData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
                    <YAxis domain={[0, 550]} tick={{ fill: "#64748b", fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "11px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Line type="monotone" dataKey="Total" stroke="#e11d48" strokeWidth={3} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="TKP" stroke="#10b981" strokeWidth={1.5} />
                    <Line type="monotone" dataKey="TIU" stroke="#3b82f6" strokeWidth={1.5} />
                    <Line type="monotone" dataKey="TWK" stroke="#f59e0b" strokeWidth={1.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <FileText className="w-10 h-10 text-slate-400" />
                <p className="text-xs text-slate-500">
                  Belum ada riwayat ujian yang selesai. Mulai simulasi untuk melihat grafik progres!
                </p>
                <Link
                  href="/tryout"
                  className="btn-interactive px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-lg"
                >
                  Mulai Ujian Pertama
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Mistake Notebook Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Mistake Notebook (Buku Catatan Kesalahan)
              </h3>
              <p className="text-xs text-slate-500">
                Koleksi otomatis seluruh soal yang salah dijawab pada sesi tryout sebelumnya.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {mistakes.filter((m) => m.isReviewed).length} / {mistakes.length} Sudah Dikuasai
            </span>
          </div>

          {mistakes.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Buku Kesalahan Masih Bersih!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Anda belum melakukan kesalahan pada ujian atau belum menyelesaikan tryout. Terus pertahankan!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mistakes.map((m) => (
                <div
                  key={m.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    m.isReviewed
                      ? "border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 opacity-75"
                      : "border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                      {m.subtest} • {m.topic}
                    </span>

                    <button
                      onClick={() => toggleMistakeReviewed(m.id, m.isReviewed)}
                      className={`btn-interactive px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 ${
                        m.isReviewed
                          ? "bg-emerald-600 text-white"
                          : "border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {m.isReviewed ? "Sudah Dikuasai" : "Tandai Dikuasai"}
                    </button>
                  </div>

                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mb-3 line-clamp-3">
                    {m.questionText}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-white/5 space-y-1">
                    <div className="font-bold text-rose-600 uppercase tracking-wider text-[10px]">
                      Kunci & Solusi:
                    </div>
                    <p className="line-clamp-2">{m.discussionText}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

