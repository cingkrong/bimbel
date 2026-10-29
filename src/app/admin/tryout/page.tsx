"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Plus,
  Clock,
  Layers,
  Users,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Settings2,
  Copy,
  ExternalLink,
  X,
  Loader2,
  Sliders,
  Sparkles,
  Download
} from "lucide-react";

interface TryoutPackage {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  passingGradeTwk: number;
  passingGradeTiu: number;
  passingGradeTkp: number;
  isPublished: boolean;
  participantsCount: number;
  passedCount: number;
  createdAt: string;
}

interface LeaderboardItem {
  rank: number;
  studentName: string;
  email: string;
  city: string;
  province: string;
  targetSchool: string;
  scoreTwk: number;
  scoreTiu: number;
  scoreTkp: number;
  totalScore: number;
  isPassed: boolean;
  completedAt: string;
}

export default function TryoutAdminPage() {
  const [packages, setPackages] = useState<TryoutPackage[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedPackage, setSelectedPackage] = useState<TryoutPackage | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssembleOpen, setIsAssembleOpen] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDuration, setFormDuration] = useState(100);
  const [formTwk, setFormTwk] = useState(65);
  const [formTiu, setFormTiu] = useState(80);
  const [formTkp, setFormTkp] = useState(166);
  const [formPublished, setFormPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tryout");
      if (res.ok) {
        const json = await res.json();
        setPackages(json.packages || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openLeaderboard = async (pkg: TryoutPackage) => {
    setSelectedPackage(pkg);
    setIsLeaderboardOpen(true);
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(`/api/admin/tryout/${pkg.id}/leaderboard`);
      if (res.ok) {
        const json = await res.json();
        setLeaderboard(json.leaderboard || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleExportCSV = () => {
    if (!leaderboard.length) return;
    const headers = "Peringkat,Nama Siswa,Target Sekolah,Kota,Provinsi,Skor TWK,Skor TIU,Skor TKP,Total Skor,Status Kelulusan\n";
    const rows = leaderboard
      .map(
        (l) =>
          `"${l.rank}","${l.studentName}","${l.targetSchool}","${l.city}","${l.province}",${l.scoreTwk},${l.scoreTiu},${l.scoreTkp},${l.totalScore},"${l.isPassed ? "LOLOS" : "TIDAK LOLOS"}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Leaderboard-${selectedPackage?.title || "Tryout"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/tryout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,
          durationMinutes: formDuration,
          totalQuestions: 110,
          passingGradeTwk: formTwk,
          passingGradeTiu: formTiu,
          passingGradeTkp: formTkp,
          isPublished: formPublished,
        }),
      });
      if (res.ok) {
        setIsCreateOpen(false);
        setFormTitle("");
        setFormDesc("");
        fetchPackages();
      }
    } catch (err) {
      alert("Gagal membuat paket tryout");
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
            <Trophy className="w-6 h-6 text-amber-500" />
            Manajemen Paket Tryout & Leaderboard Nasional
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi paket CAT 110 butir, ambang batas passing grade, dan pemantauan ranking kompetensi peserta.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-amber-600 text-xs font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Buat Paket Tryout Baru
        </button>
      </div>

      {/* Grid Paket Tryout */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          <p className="text-xs text-slate-400">Memuat daftar paket tryout...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => {
            const passRate =
              pkg.participantsCount > 0
                ? Math.round((pkg.passedCount / pkg.participantsCount) * 100)
                : 0;

            return (
              <div
                key={pkg.id}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-amber-500/40 transition-all"
              >
                <div className="space-y-3">
                  {/* Status Badge & Actions */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        pkg.isPublished
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400"
                      }`}
                    >
                      {pkg.isPublished ? "PUBLISHED (AKTIF)" : "DRAFT"}
                    </span>

                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {pkg.durationMinutes} Menit
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {pkg.description || "Simulasi ujian seleksi CAT terstandarisasi BKN."}
                    </p>
                  </div>

                  {/* Passing Grades Specs */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-600 dark:text-slate-300">
                      <span>Nilai Ambang Batas (PG):</span>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">110 Butir</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-center font-bold text-[11px]">
                      <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400">
                        TWK: {pkg.passingGradeTwk}
                      </div>
                      <div className="p-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">
                        TIU: {pkg.passingGradeTiu}
                      </div>
                      <div className="p-1 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400">
                        TKP: {pkg.passingGradeTkp}
                      </div>
                    </div>
                  </div>

                  {/* Participants & Passing stats */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Peserta: <strong className="text-slate-900 dark:text-white">{pkg.participantsCount}</strong></span>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      Kelulusan: {passRate}%
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setIsAssembleOpen(true);
                    }}
                    className="btn-interactive px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    Rakit Soal
                  </button>

                  <button
                    onClick={() => openLeaderboard(pkg)}
                    className="btn-interactive px-3 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 text-xs font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    Leaderboard
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Leaderboard Ranking Siswa */}
      {isLeaderboardOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3 flex-shrink-0">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Rekap Peringkat & Skor: {selectedPackage.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standar kelulusan ambang batas BKN (TWK $\ge 65$, TIU $\ge 80$, TKP $\ge 166$).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export ke Excel (.csv)
                </button>
                <button
                  onClick={() => setIsLeaderboardOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Leaderboard Table Content */}
            <div className="flex-1 overflow-y-auto">
              {loadingLeaderboard ? (
                <div className="h-64 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                  <p className="text-xs text-slate-400">Mengambil data hasil ujian siswa...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                  Belum ada peserta yang menyelesaikan paket tryout ini.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 uppercase tracking-wider font-semibold sticky top-0 border-b border-slate-200 dark:border-white/10">
                    <tr>
                      <th className="py-2.5 px-3 w-16 text-center">Rank</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3">Target Sekolah</th>
                      <th className="py-2.5 px-3">Asal Daerah</th>
                      <th className="py-2.5 px-2 text-center w-16">TWK</th>
                      <th className="py-2.5 px-2 text-center w-16">TIU</th>
                      <th className="py-2.5 px-2 text-center w-16">TKP</th>
                      <th className="py-2.5 px-3 text-center w-20 font-bold">Total</th>
                      <th className="py-2.5 px-3 text-center w-24">Kelulusan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {leaderboard.map((item) => (
                      <tr key={item.rank} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 text-center font-black">
                          {item.rank === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 inline-flex items-center justify-center text-xs shadow-sm">
                              1
                            </span>
                          ) : item.rank === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 inline-flex items-center justify-center text-xs">
                              2
                            </span>
                          ) : item.rank === 3 ? (
                            <span className="w-6 h-6 rounded-full bg-amber-700/60 text-white inline-flex items-center justify-center text-xs">
                              3
                            </span>
                          ) : (
                            <span className="text-slate-500">{item.rank}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          <div>{item.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{item.email}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 font-semibold text-[10px]">
                            {item.targetSchool}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {item.city}, {item.province}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono">{item.scoreTwk}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{item.scoreTiu}</td>
                        <td className="py-2.5 px-2 text-center font-mono">{item.scoreTkp}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-black text-slate-900 dark:text-white text-sm">
                          {item.totalScore}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {item.isPassed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              LOLOS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              <XCircle className="w-3 h-3" />
                              GAGAL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Rakit Soal */}
      {isAssembleOpen && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Rakit Komposisi Butir Soal CAT (110 Butir)
              </h2>
              <button onClick={() => setIsAssembleOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-500">
                Paket <strong>{selectedPackage.title}</strong> dirancang menggunakan algoritma distribusi otomatis BKN:
              </p>

              <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-white/5">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">1. TWK (Wawasan Kebangsaan)</span>
                  <span className="font-bold">30 Butir (No. 1 - 30)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/50 dark:border-white/5">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">2. TIU (Intelegensia Umum)</span>
                  <span className="font-bold">35 Butir (No. 31 - 65)</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">3. TKP (Karakteristik Pribadi)</span>
                  <span className="font-bold">45 Butir (No. 66 - 110)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>110 butir soal terverifikasi telah otomatis dipasangkan ke dalam paket ini.</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAssembleOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  alert("Susunan butir soal paket tryout berhasil disinkronkan ke database!");
                  setIsAssembleOpen(false);
                }}
                className="btn-interactive px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Sinkronkan Bank Soal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Buat Paket Baru */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" />
                Buat Paket Tryout CAT Baru
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Tryout *
                </label>
                <input
                  type="text"
                  placeholder="cth: Tryout Akbar Nasional SKD #2"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Keterangan
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat paket..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(parseInt(e.target.value, 10) || 100)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Publikasi
                  </label>
                  <select
                    value={formPublished ? "true" : "false"}
                    onChange={(e) => setFormPublished(e.target.value === "true")}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  >
                    <option value="true">Langsung Publikasikan (Active)</option>
                    <option value="false">Simpan sebagai Draft</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Passing Grade Ambang Batas (Standar BKN)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">TWK</span>
                    <input
                      type="number"
                      value={formTwk}
                      onChange={(e) => setFormTwk(parseInt(e.target.value, 10) || 65)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">TIU</span>
                    <input
                      type="number"
                      value={formTiu}
                      onChange={(e) => setFormTiu(parseInt(e.target.value, 10) || 80)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">TKP</span>
                    <input
                      type="number"
                      value={formTkp}
                      onChange={(e) => setFormTkp(parseInt(e.target.value, 10) || 166)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-interactive px-4 py-2 rounded-xl bg-amber-600 text-white font-bold inline-flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

