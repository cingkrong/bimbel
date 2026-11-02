"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Flag,
  Filter,
  Trophy,
  Loader2,
  Sparkles,
  BookOpen,
  Check,
  ChevronRight
} from "lucide-react";

export default function ExamDiscussionPage() {
  const params = useParams();
  const router = useRouter();
  const tryoutId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "CORRECT" | "WRONG" | "SKIPPED" | "DOUBT">("ALL");
  const [reportingQuestion, setReportingQuestion] = useState<any>(null);
  const [reportType, setReportType] = useState("Kunci Jawaban Salah");
  const [reportNotes, setReportNotes] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    async function loadDiscussion() {
      try {
        const res = await fetch(`/api/exam/${tryoutId}/discussion`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to load discussion");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDiscussion();
  }, [tryoutId, router]);

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingQuestion) return;

    try {
      const res = await fetch("/api/exam/report-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: reportingQuestion.questionId,
          reportType,
          notes: reportNotes,
        }),
      });

      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportingQuestion(null);
          setReportSuccess(false);
          setReportNotes("");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-canvas-dark">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
          <span className="text-xs font-semibold text-slate-500">Memuat Lembar Pembahasan & Kunci Jawaban...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Pembahasan belum tersedia atau sesi ujian belum selesai dikerjakan.
        </p>
        <Link href="/tryout" className="btn-interactive px-5 py-2.5 text-xs font-bold bg-rose-600 text-white rounded-xl shadow-sm inline-block">
          Kembali ke Katalog Tryout
        </Link>
      </div>
    );
  }

  const { summary, questions } = data;

  // Filter questions
  const filteredQuestions = questions.filter((q: any) => {
    if (activeFilter === "CORRECT") return q.isCorrect;
    if (activeFilter === "WRONG") return q.isAnswered && !q.isCorrect;
    if (activeFilter === "SKIPPED") return !q.isAnswered;
    if (activeFilter === "DOUBT") return q.isDoubtful;
    return true;
  });

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-canvas-dark text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Background Dot Matrix Pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30 dark:opacity-15 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200/80 dark:border-white/10 pb-6">
          <div className="space-y-1.5">
            <Link
              href="/tryout"
              className="inline-flex items-center text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Kembali ke Katalog Tryout
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Pembahasan Lengkap & Kunci Jawaban
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              {summary.tryoutTitle}
            </p>
          </div>

          {/* Score Pill */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-white/10 shadow-sm flex-shrink-0">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                Total Skor CAT
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                {summary.totalScore} <span className="text-xs font-normal text-slate-400">/ 550</span>
              </div>
            </div>
            <span
              className={`text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${
                summary.isPassed
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
              }`}
            >
              {summary.isPassed ? "LOLOS" : "TIDAK LOLOS"}
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "ALL"
                ? "bg-slate-900 text-white dark:bg-rose-600 shadow-sm"
                : "bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-slate-300"
            }`}
          >
            Semua Soal ({questions.length})
          </button>
          <button
            onClick={() => setActiveFilter("CORRECT")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "CORRECT"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-slate-300"
            }`}
          >
            Benar ({questions.filter((q: any) => q.isCorrect).length})
          </button>
          <button
            onClick={() => setActiveFilter("WRONG")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "WRONG"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-slate-300"
            }`}
          >
            Salah ({questions.filter((q: any) => q.isAnswered && !q.isCorrect).length})
          </button>
          <button
            onClick={() => setActiveFilter("SKIPPED")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "SKIPPED"
                ? "bg-slate-700 text-white shadow-sm"
                : "bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-slate-300"
            }`}
          >
            Dilewati ({questions.filter((q: any) => !q.isAnswered).length})
          </button>
          <button
            onClick={() => setActiveFilter("DOUBT")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === "DOUBT"
                ? "bg-amber-400 text-slate-950 shadow-sm"
                : "bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:border-slate-300"
            }`}
          >
            Ragu-ragu ({questions.filter((q: any) => q.isDoubtful).length})
          </button>
        </div>

        {/* Discussion List */}
        <div className="space-y-6">
          {filteredQuestions.map((q: any) => (
            <div
              key={q.questionNumber}
              className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-surface-dark p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Question Top Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-slate-900 text-white dark:bg-rose-600 text-xs font-black tabular-nums">
                    #{q.questionNumber}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                    {q.subtest} • {q.topic}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                      q.isCorrect
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : q.isAnswered
                        ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                    }`}
                  >
                    {q.isCorrect ? "BENAR" : q.isAnswered ? "SALAH" : "DILEWATI"} (+{q.scoreEarned} Poin)
                  </span>

                  <button
                    onClick={() => setReportingQuestion(q)}
                    title="Laporkan Soal"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {q.questionText}
              </p>

              {/* Options with Scores and Highlights */}
              <div className="space-y-2.5">
                {q.options.map((opt: any) => {
                  const isSelectedByStudent = q.selectedOptionId === opt.id;
                  const isHighestScoring =
                    q.subtest === "TKP" ? opt.score === 5 : opt.isCorrect;

                  let borderStyle = "border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/5";

                  if (isHighestScoring) {
                    borderStyle = "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20";
                  } else if (isSelectedByStudent && !isHighestScoring) {
                    borderStyle = "border-rose-500 bg-rose-50/60 dark:bg-rose-950/20";
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3.5 ${borderStyle}`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            isHighestScoring
                              ? "bg-emerald-600 text-white"
                              : isSelectedByStudent
                              ? "bg-rose-600 text-white"
                              : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {opt.optionLabel}
                        </span>
                        <span className="leading-relaxed pt-1 text-slate-800 dark:text-slate-200">
                          {opt.optionText}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                        {isSelectedByStudent && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                            Pilihan Anda
                          </span>
                        )}
                        <span
                          className={`font-mono font-bold text-xs tabular-nums ${
                            isHighestScoring ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-slate-400"
                          }`}
                        >
                          {opt.score} Poin
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation / Discussion Block */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-2 text-xs">
                <div className="font-extrabold text-rose-600 flex items-center gap-2 text-[11px] uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Pembahasan Kunci & Analisis Jawaban:
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line pl-6">
                  {q.discussionText}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Laporkan Soal */}
        {reportingQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-rose-600">
                  <Flag className="w-5 h-5" />
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Laporkan Soal #{reportingQuestion.questionNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setReportingQuestion(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {reportSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold text-center border border-emerald-200">
                  Laporan berhasil dikirim! Tim akademik akan segera meninjau soal ini.
                </div>
              ) : (
                <form onSubmit={handleSendReport} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Jenis Masalah
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-white/5 text-xs font-medium"
                    >
                      <option value="Kunci Jawaban Salah">Kunci Jawaban Salah</option>
                      <option value="Soal Ambiguitas">Soal Ambiguitas / Multi-Tafsir</option>
                      <option value="Typo / Kesalahan Ketik">Typo / Kesalahan Ketik</option>
                      <option value="Gambar Rusak">Gambar Rusak / Tidak Muncul</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Catatan Koreksi Tambahan
                    </label>
                    <textarea
                      rows={3}
                      value={reportNotes}
                      onChange={(e) => setReportNotes(e.target.value)}
                      placeholder="Jelaskan sumber atau alasan ketidaksesuaian kunci jawaban..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-white/5 text-xs font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setReportingQuestion(null)}
                      className="btn-interactive px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/10"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="btn-interactive px-5 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
                    >
                      Kirim Laporan
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
