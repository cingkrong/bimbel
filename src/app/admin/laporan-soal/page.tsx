"use client";

import { useEffect, useState } from "react";
import {
  Flag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  ExternalLink,
  HelpCircle,
  X,
  Loader2,
  FileEdit,
  Clock
} from "lucide-react";

interface Option {
  id: string;
  optionLabel: string;
  optionText: string;
  score: number;
  isCorrect: boolean;
}

interface Question {
  id: string;
  subtest: "TWK" | "TIU" | "TKP";
  topic: string;
  questionText: string;
  discussionText: string;
  options: Option[];
}

interface Report {
  id: string;
  reportType: string;
  notes: string;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  adminNotes: string | null;
  createdAt: string;
  user: {
    username: string;
    email: string;
    profile?: { fullName: string } | null;
  };
  question: Question;
}

export default function LaporanSoalAdminPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [reviewingReport, setReviewingReport] = useState<Report | null>(null);

  // Form inside modal
  const [selectedCorrectOption, setSelectedCorrectOption] = useState<string>("");
  const [revisedDiscussion, setRevisedDiscussion] = useState<string>("");
  const [adminNoteInput, setAdminNoteInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const url =
        selectedStatus === "ALL"
          ? "/api/admin/reports"
          : `/api/admin/reports?status=${selectedStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setReports(json.reports || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedStatus]);

  const openReviewModal = (rep: Report) => {
    setReviewingReport(rep);
    const correct = rep.question.options.find((o) => o.isCorrect || o.score === 5);
    setSelectedCorrectOption(correct?.optionLabel || "A");
    setRevisedDiscussion(rep.question.discussionText || "");
    setAdminNoteInput(rep.adminNotes || "Telah diverifikasi oleh tim kurikulum akademik.");
  };

  const handleResolve = async (actionStatus: "RESOLVED" | "REJECTED") => {
    if (!reviewingReport) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: reviewingReport.id,
          status: actionStatus,
          adminNotes: adminNoteInput,
          questionId: reviewingReport.question.id,
          newCorrectLabel: actionStatus === "RESOLVED" ? selectedCorrectOption : null,
          revisedDiscussion: actionStatus === "RESOLVED" ? revisedDiscussion : null,
        }),
      });

      if (res.ok) {
        setReviewingReport(null);
        fetchReports();
      }
    } catch (err) {
      alert("Gagal memproses moderasi laporan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Flag className="w-6 h-6 text-rose-500" />
            Moderasi Laporan & Komplain Butir Soal Siswa
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tinjau umpan balik butir soal yang dilaporkan siswa, revisi kunci jawaban seketika, dan catat berita acara akademik.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10 text-xs">
          {[
            { id: "ALL", label: "Semua Tiket" },
            { id: "PENDING", label: "Menunggu Review" },
            { id: "RESOLVED", label: "Selesai Direvisi" },
            { id: "REJECTED", label: "Ditolak / Valid" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                selectedStatus === tab.id
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            <p className="text-xs text-slate-400">Memuat tiket komplain...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Tidak ada laporan butir soal dengan status yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4 w-36">Waktu Masuk</th>
                  <th className="py-3 px-4 w-44">Siswa Pelapor</th>
                  <th className="py-3 px-4 w-36">Subtes & Materi</th>
                  <th className="py-3 px-4 w-40">Tipe Keluhan</th>
                  <th className="py-3 px-4">Uraian / Pesan Siswa</th>
                  <th className="py-3 px-4 w-28 text-center">Status</th>
                  <th className="py-3 px-4 w-28 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(rep.createdAt).toLocaleString("id-ID", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {rep.user.profile?.fullName || rep.user.username}
                      </div>
                      <div className="text-[10px] text-slate-400">{rep.user.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {rep.question.subtest}
                      </span>
                      <div className="text-[10px] text-slate-500 truncate max-w-[130px]" title={rep.question.topic}>
                        {rep.question.topic}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {rep.reportType}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs">
                      <div className="line-clamp-2" title={rep.notes}>
                        {rep.notes}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          rep.status === "RESOLVED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : rep.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400"
                        }`}
                      >
                        {rep.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openReviewModal(rep)}
                        className="btn-interactive px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-rose-600 font-bold"
                      >
                        Tinjau
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Tinjau & Resolusi Soal */}
      {reviewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileEdit className="w-5 h-5 text-rose-500" />
                  Resolusi Tiket Keluhan Butir Soal
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pelapor: <strong>{reviewingReport.user.profile?.fullName || reviewingReport.user.username}</strong> ({reviewingReport.reportType})
                </p>
              </div>
              <button
                onClick={() => setReviewingReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Note Box */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300">
              <strong className="block mb-1">Catatan Siswa:</strong>
              <p className="italic">"{reviewingReport.notes}"</p>
            </div>

            {/* Question Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs space-y-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-full mr-2">
                  {reviewingReport.question.subtest}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {reviewingReport.question.topic}
                </span>
                <p className="mt-2 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {reviewingReport.question.questionText}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-500">Pilih Kunci Jawaban yang Benar:</span>
                {reviewingReport.question.options.map((opt) => (
                  <label
                    key={opt.optionLabel}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                      selectedCorrectOption === opt.optionLabel
                        ? "border-emerald-500 bg-emerald-500/10 font-bold text-emerald-900 dark:text-emerald-300"
                        : "border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedCorrect"
                      checked={selectedCorrectOption === opt.optionLabel}
                      onChange={() => setSelectedCorrectOption(opt.optionLabel)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="w-5 font-bold">{opt.optionLabel}.</span>
                    <span className="flex-1">{opt.optionText}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Discussion Edit */}
            <div className="space-y-1 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Revisi Teks Pembahasan (Opsional):
              </label>
              <textarea
                rows={3}
                value={revisedDiscussion}
                onChange={(e) => setRevisedDiscussion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Admin Response Note */}
            <div className="space-y-1 text-xs">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Catatan Berita Acara / Alasan Resolusi:
              </label>
              <input
                type="text"
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => handleResolve("REJECTED")}
                disabled={isSubmitting}
                className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold"
              >
                Tolak Komplain (Soal Sudah Tepat)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingReport(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleResolve("RESOLVED")}
                  disabled={isSubmitting}
                  className="btn-interactive px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Terapkan Koreksi & Tutup Tiket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

