"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { useExamStore } from "@/store/useExamStore";
import { formatTimeSeconds } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Clock,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Menu,
  X,
  FileCheck2,
  Trophy,
  Loader2
} from "lucide-react";

export default function ExamEnginePage() {
  const params = useParams();
  const router = useRouter();
  const tryoutId = params.id as string;

  const {
    tryout,
    sessionId,
    questions,
    currentQuestionIndex,
    answers,
    durationLeftSec,
    isCompleted,
    isSaving,
    isSubmitting,
    initExam,
    setCurrentIndex,
    nextQuestion,
    prevQuestion,
    selectOption,
    toggleDoubtful,
    decrementTimer,
    setSubmitting,
  } = useExamStore();

  const [loading, setLoading] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  // 1. Fetch exam package data
  useEffect(() => {
    async function loadExam() {
      try {
        const res = await fetch(`/api/exam/${tryoutId}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push(`/login?redirect=/tryout/${tryoutId}`);
            return;
          }
          throw new Error("Failed to load exam");
        }
        const data = await res.json();
        initExam(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [tryoutId, initExam, router]);

  // 2. Timer Heartbeat
  useEffect(() => {
    if (loading || isCompleted || resultData) return;

    const interval = setInterval(() => {
      decrementTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, isCompleted, resultData, decrementTimer]);

  // 3. Auto-submit when timer expires
  useEffect(() => {
    if (!loading && durationLeftSec === 0 && !isCompleted && !resultData && sessionId) {
      handleFinishExam();
    }
  }, [durationLeftSec, loading, isCompleted, resultData, sessionId]);

  const handleFinishExam = async () => {
    if (!sessionId || isSubmitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/exam/scoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        const data = await res.json();
        setResultData(data.result);
        setShowFinishModal(false);

        if (data.result.isPassed) {
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {}
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
          <div className="text-sm font-semibold tracking-wide">
            Menyiapkan Lembar Soal CAT BKN...
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const currentAnswer = currentQ ? answers[currentQ.questionNumber] : null;

  // Stats
  const totalAnswered = Object.values(answers).filter((a) => a.selectedOptionId !== null).length;
  const totalDoubtful = Object.values(answers).filter((a) => a.isDoubtful).length;
  const totalUnanswered = questions.length - totalAnswered;

  // Subtest filters for jump navigation
  const subtestTwk = questions.filter((q) => q.subtest === "TWK");
  const subtestTiu = questions.filter((q) => q.subtest === "TIU");
  const subtestTkp = questions.filter((q) => q.subtest === "TKP");

  const isTimerCritical = durationLeftSec < 300; // Under 5 minutes

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-canvas-dark text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Sticky Exam Header */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Simulasi Ujian Mandiri CAT BKN
              </span>
              <span className="text-sm font-bold truncate max-w-xs md:max-w-md">
                {tryout?.title}
              </span>
            </div>

            {/* Subtest Quick Tabs */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setCurrentIndex(0)}
                className={`px-2.5 py-1 rounded ${
                  currentQ?.subtest === "TWK"
                    ? "bg-rose-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                TWK (1-30)
              </button>
              <button
                onClick={() => setCurrentIndex(30)}
                className={`px-2.5 py-1 rounded ${
                  currentQ?.subtest === "TIU"
                    ? "bg-rose-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                TIU (31-65)
              </button>
              <button
                onClick={() => setCurrentIndex(65)}
                className={`px-2.5 py-1 rounded ${
                  currentQ?.subtest === "TKP"
                    ? "bg-rose-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                TKP (66-110)
              </button>
            </div>
          </div>

          {/* Timer & Submit Action */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold tabular-nums transition-colors ${
                isTimerCritical
                  ? "bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse"
                  : "bg-slate-800 border-slate-700 text-white"
              }`}
            >
              <Clock className={`w-4 h-4 ${isTimerCritical ? "text-rose-400" : "text-amber-400"}`} />
              <span>{formatTimeSeconds(durationLeftSec)}</span>
            </div>

            <button
              onClick={() => setShowFinishModal(true)}
              className="btn-interactive px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              <FileCheck2 className="w-4 h-4 mr-1 hidden sm:inline" />
              Selesaikan Ujian
            </button>

            {/* Mobile Navigation Drawer Trigger */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Card & Controls (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-4">
          {currentQ && (
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 sm:p-8 shadow-sm">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-slate-900 text-white dark:bg-rose-600 text-xs font-extrabold tabular-nums">
                    Soal #{currentQ.questionNumber}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                    {currentQ.subtest} • {currentQ.topic}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isSaving && (
                    <span className="text-[11px] font-mono text-slate-400 animate-pulse">
                      Menyimpan...
                    </span>
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Bobot: {currentQ.subtest === "TKP" ? "1 s/d 5 Poin" : "5 Poin"}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium mb-8 whitespace-pre-line">
                {currentQ.questionText}
              </div>

              {/* Options List */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = currentAnswer?.selectedOptionId === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectOption(currentQ.questionNumber, opt.id)}
                      className={`w-full p-4 rounded-xl text-left border transition-all duration-140 flex items-start gap-3.5 ${
                        isSelected
                          ? "border-rose-600 bg-rose-50/60 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 shadow-sm"
                          : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/5 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                          isSelected
                            ? "bg-rose-600 text-white"
                            : "bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {opt.optionLabel}
                      </div>
                      <div className="text-xs sm:text-sm pt-0.5 leading-relaxed font-normal">
                        {opt.optionText}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Navigation Toolbar */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="btn-interactive px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-200 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Sebelumnya
                </button>

                {/* Ragu-ragu Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30">
                  <input
                    type="checkbox"
                    checked={Boolean(currentAnswer?.isDoubtful)}
                    onChange={() => toggleDoubtful(currentQ.questionNumber)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300"
                  />
                  <span>Ragu-ragu (Kuning)</span>
                </label>

                <button
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="btn-interactive px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-700 text-white disabled:opacity-40"
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 110-Question Matrix Sidebar (4 cols on desktop) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24">
          <QuestionMatrixSidebar
            questions={questions}
            answers={answers}
            currentIndex={currentQuestionIndex}
            onSelectQuestion={setCurrentIndex}
            totalAnswered={totalAnswered}
            totalDoubtful={totalDoubtful}
            totalUnanswered={totalUnanswered}
          />
        </div>
      </main>

      {/* Mobile Drawer Question Matrix */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-surface-dark h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Navigasi 110 Soal CAT
                </h3>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <QuestionMatrixSidebar
                questions={questions}
                answers={answers}
                currentIndex={currentQuestionIndex}
                onSelectQuestion={(idx) => {
                  setCurrentIndex(idx);
                  setMobileDrawerOpen(false);
                }}
                totalAnswered={totalAnswered}
                totalDoubtful={totalDoubtful}
                totalUnanswered={totalUnanswered}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal Before Submit */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <FileCheck2 className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Konfirmasi Penyelesaian Ujian
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin mengakhiri sesi simulasi CAT BKN ini? Pastikan Anda telah meninjau seluruh butir soal.
            </p>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-center text-xs">
              <div>
                <div className="font-extrabold text-emerald-600 text-sm tabular-nums">
                  {totalAnswered}
                </div>
                <div className="text-[10px] text-slate-500">Dijawab</div>
              </div>
              <div>
                <div className="font-extrabold text-amber-500 text-sm tabular-nums">
                  {totalDoubtful}
                </div>
                <div className="text-[10px] text-slate-500">Ragu-ragu</div>
              </div>
              <div>
                <div className="font-extrabold text-slate-500 text-sm tabular-nums">
                  {totalUnanswered}
                </div>
                <div className="text-[10px] text-slate-500">Kosong</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowFinishModal(false)}
                disabled={isSubmitting}
                className="btn-interactive px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
              >
                Kembali Periksa
              </button>
              <button
                onClick={handleFinishExam}
                disabled={isSubmitting}
                className="btn-interactive px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
              >
                {isSubmitting ? "Menghitung Skor..." : "Ya, Selesaikan Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Dialog Modal */}
      {resultData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl text-center space-y-6">
            <div className="space-y-2">
              <div
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg ${
                  resultData.isPassed
                    ? "bg-emerald-500 text-white shadow-emerald-500/30"
                    : "bg-rose-500 text-white shadow-rose-500/30"
                }`}
              >
                <Trophy className="w-8 h-8" />
              </div>

              <div
                className={`inline-block px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                  resultData.isPassed
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {resultData.isPassed ? "LOLOS PASSING GRADE SKD" : "BELUM LOLOS PASSING GRADE"}
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Total Skor CAT: <span className="tabular-nums text-rose-600">{resultData.totalScore}</span> / 550
              </h2>
            </div>

            {/* Subtest Score Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <div className="text-[11px] font-semibold text-slate-500">TWK (PG: {resultData.passingGradeTwk})</div>
                <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
                  {resultData.scoreTwk}
                </div>
                <div className="text-[10px] font-bold mt-1 text-emerald-500">
                  {resultData.scoreTwk >= resultData.passingGradeTwk ? "Lolos" : "Gagal"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <div className="text-[11px] font-semibold text-slate-500">TIU (PG: {resultData.passingGradeTiu})</div>
                <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
                  {resultData.scoreTiu}
                </div>
                <div className="text-[10px] font-bold mt-1 text-emerald-500">
                  {resultData.scoreTiu >= resultData.passingGradeTiu ? "Lolos" : "Gagal"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                <div className="text-[11px] font-semibold text-slate-500">TKP (PG: {resultData.passingGradeTkp})</div>
                <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
                  {resultData.scoreTkp}
                </div>
                <div className="text-[10px] font-bold mt-1 text-emerald-500">
                  {resultData.scoreTkp >= resultData.passingGradeTkp ? "Lolos" : "Gagal"}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Semua kesalahan pada sesi ini telah otomatis didaftarkan ke <b>Mistake Notebook</b> Anda untuk evaluasi kompetensi lebih lanjut.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => router.push(`/tryout/${tryoutId}/discussion`)}
                className="btn-interactive py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Lihat Pembahasan Lengkap
              </button>
              <button
                onClick={() => router.push("/perkembangan-belajar")}
                className="btn-interactive py-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 text-xs font-bold"
              >
                Buka Raport Kompetensi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 110 Question Grid Sidebar Component
function QuestionMatrixSidebar({
  questions,
  answers,
  currentIndex,
  onSelectQuestion,
  totalAnswered,
  totalDoubtful,
  totalUnanswered,
}: {
  questions: any[];
  answers: any;
  currentIndex: number;
  onSelectQuestion: (idx: number) => void;
  totalAnswered: number;
  totalDoubtful: number;
  totalUnanswered: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
          Navigasi 110 Soal
        </h3>
        <span className="text-xs font-mono text-slate-500 tabular-nums">
          {totalAnswered}/110 Terjawab
        </span>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span>Dijawab</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-400" />
          <span>Ragu-ragu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700" />
          <span>Kosong</span>
        </div>
      </div>

      {/* 110 Grid Tiles */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-5 gap-1.5 max-h-[50vh] overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const ans = answers[q.questionNumber];
          const isSelected = idx === currentIndex;
          const isAnswered = ans && ans.selectedOptionId !== null;
          const isDoubt = ans && ans.isDoubtful;

          let tileColor = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

          if (isDoubt) {
            tileColor = "bg-amber-400 text-slate-950 border-amber-500 font-bold";
          } else if (isAnswered) {
            tileColor = "bg-emerald-500 text-white border-emerald-600 font-bold";
          }

          return (
            <button
              key={q.questionNumber}
              onClick={() => onSelectQuestion(idx)}
              className={`h-9 rounded-lg text-xs font-mono tabular-nums flex items-center justify-center border transition-all ${tileColor} ${
                isSelected ? "ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-slate-900 scale-105" : ""
              }`}
            >
              {q.questionNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}

