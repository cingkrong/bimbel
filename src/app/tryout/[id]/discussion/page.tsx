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
  Loader2
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
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Pembahasan belum tersedia atau sesi ujian belum selesai dikerjakan.
        </p>
        <Link href="/tryout" className="btn-interactive px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-lg">
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <Link
            href="/tryout"
            className="inline-flex items-center text-xs font-semibold text-rose-600 hover:text-rose-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Tryout
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Pembahasan Lengkap & Kunci Jawaban
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {summary.tryoutTitle}
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Skor CAT
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
              {summary.totalScore} / 550
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              summary.isPassed
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
            }`}
          >
            {summary.isPassed ? "LOLOS" : "TIDAK LOLOS"}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeFilter === "ALL"
              ? "bg-slate-900 text-white dark:bg-rose-600"
              : "bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10"
          }`}
        >
          Semua Soal ({questions.length})
        </button>
        <button
          onClick={() => setActiveFilter("CORRECT")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeFilter === "CORRECT"
              ? "bg-emerald-600 text-white"
              : "bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10"
          }`}
        >
          Benar ({questions.filter((q: any) => q.isCorrect).length})
        </button>
        <button
          onClick={() => setActiveFilter("WRONG")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeFilter === "WRONG"
              ? "bg-rose-600 text-white"
              : "bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10"
          }`}
        >
          Salah ({questions.filter((q: any) => q.isAnswered && !q.isCorrect).length})
        </button>
        <button
          onClick={() => setActiveFilter("SKIPPED")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeFilter === "SKIPPED"
              ? "bg-slate-700 text-white"
              : "bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10"
          }`}
        >
          Dilewati ({questions.filter((q: any) => !q.isAnswered).length})
        </button>
        <button
          onClick={() => setActiveFilter("DOUBT")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeFilter === "DOUBT"
              ? "bg-amber-500 text-slate-950"
              : "bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10"
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
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 sm:p-8 shadow-sm space-y-5"
          >
            {/* Question Top Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-slate-900 text-white text-xs font-bold">
                  #{q.questionNumber}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                  {q.subtest} • {q.topic}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
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
            <div className="space-y-2">
              {q.options.map((opt: any) => {
                const isSelectedByStudent = q.selectedOptionId === opt.id;
                const isHighestScoring =
                  q.subtest === "TKP" ? opt.score === 5 : opt.isCorrect;

                let borderStyle = "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5";

                if (isHighestScoring) {
                  borderStyle = "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20";
                } else if (isSelectedByStudent && !isHighestScoring) {
                  borderStyle = "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20";
                }

                return (
                  <div
                    key={opt.id}
                    className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-3 ${borderStyle}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                          isHighestScoring
                            ? "bg-emerald-600 text-white"
                            : isSelectedByStudent
                            ? "bg-rose-600 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {opt.optionLabel}
                      </span>
                      <span className="leading-relaxed pt-0.5 text-slate-800 dark:text-slate-200">
                        {opt.optionText}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isSelectedByStudent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                          Pilihan Anda
                        </span>
                      )}
                      <span
                        className={`font-mono font-bold text-[11px] ${
                          isHighestScoring ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"
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
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-1.5 text-xs">
              <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-rose-600">
                <CheckCircle2 className="w-4 h-4" />
                Pembahasan & Analisis Solusi:
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {q.discussionText}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Laporkan Soal */}
      {reportingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2 text-rose-600">
                <Flag className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Laporkan Soal #{reportingQuestion.questionNumber}
                </h3>
              </div>
              <button
                onClick={() => setReportingQuestion(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center">
                Laporan berhasil dikirim! Tim akademik akan meninjau soal ini.
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Masalah
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-surface-dark text-xs"
                  >
                    <option value="Kunci Jawaban Salah">Kunci Jawaban Salah</option>
                    <option value="Soal Ambiguitas">Soal Ambiguitas / Multi-Tafsir</option>
                    <option value="Typo / Kesalahan Ketik">Typo / Kesalahan Ketik</option>
                    <option value="Gambar Rusak">Gambar Rusak / Tidak Muncul</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Catatan Tambahan
                  </label>
                  <textarea
                    rows={3}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="Jelaskan alasan atau referensi sumber koreksi Anda..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-surface-dark text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingQuestion(null)}
                    className="btn-interactive px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-interactive px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
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
  );
}

