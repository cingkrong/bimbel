"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  ShieldAlert,
  Smartphone,
  Laptop,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  Lock,
  LogOut,
  Trophy,
  Activity
} from "lucide-react";

interface SessionInfo {
  id: string;
  deviceId: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  isActive: boolean;
  lastActiveAt: string;
}

interface Student {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  profile?: {
    fullName: string;
    phone?: string | null;
    city?: string | null;
    province?: string | null;
    targetSchool?: string | null;
  } | null;
  tryoutsCompleted: number;
  averageScore: number;
  sessions: SessionInfo[];
}

export default function SiswaAdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const url = search.trim()
        ? `/api/admin/students?search=${encodeURIComponent(search.trim())}`
        : "/api/admin/students";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setStudents(json.students || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleForceLogout = async (userId: string) => {
    if (
      !confirm(
        "PERINGATAN KEAMANAN: Reset sesi akan memaksa logout akun siswa dari seluruh gadget aktif seketika. Lanjutkan?"
      )
    )
      return;

    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_SESSIONS", userId }),
      });

      if (res.ok) {
        alert("Sesi perangkat siswa berhasil diputus. Siswa harus login ulang.");
        setSelectedStudent(null);
        fetchStudents();
      }
    } catch (err) {
      alert("Gagal mereset sesi perangkat");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Direktori Siswa & Kontrol Sesi Multi-Perangkat
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau profil belajar, target sekolah kedinasan, riwayat skor CAT, dan kontrol anti-account sharing.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Cari nama, email, username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-2 w-64 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </form>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs text-slate-400">Memuat basis data siswa...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Tidak ada siswa ditemukan yang cocok dengan kueri pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 w-40">No. WhatsApp</th>
                  <th className="py-3 px-4 w-44">Domisili Daerah</th>
                  <th className="py-3 px-4 w-36">Target Sekolah</th>
                  <th className="py-3 px-4 w-28 text-center">Tryout</th>
                  <th className="py-3 px-4 w-28 text-center font-bold">Rata-rata</th>
                  <th className="py-3 px-4 w-36 text-center">Status Sesi</th>
                  <th className="py-3 px-4 w-28 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {students.map((stu) => {
                  const activeSessionsCount = stu.sessions?.filter((s) => s.isActive)?.length || 1;
                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {stu.profile?.fullName || stu.username}
                        </div>
                        <div className="text-[10px] text-slate-400">{stu.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {stu.profile?.phone || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {stu.profile?.city
                          ? `${stu.profile.city}, ${stu.profile.province || ""}`
                          : "Indonesia"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold text-[10px]">
                          {stu.profile?.targetSchool || "PKN STAN"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {stu.tryoutsCompleted}x CAT
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-black text-slate-900 dark:text-white">
                        {stu.averageScore}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {activeSessionsCount} Gadget Aktif
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedStudent(stu)}
                          className="btn-interactive px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 font-bold text-slate-700 dark:text-slate-300"
                        >
                          Inspeksi
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Inspeksi Perangkat Siswa & Anti-Sharing Session */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-600" />
                  Inspeksi Perangkat: {selectedStudent.profile?.fullName || selectedStudent.username}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedStudent.email}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Device Session List */}
            <div className="space-y-3 text-xs">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Sesi Perangkat yang Sedang Aktif (Maks 1 Sesi Aktif):
              </p>

              {selectedStudent.sessions && selectedStudent.sessions.length > 0 ? (
                selectedStudent.sessions.map((sess, idx) => (
                  <div
                    key={sess.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-blue-500" />
                        {sess.deviceInfo || "Browser Desktop / Chrome"}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        ONLINE
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                      <div>
                        IP Address: <strong className="text-slate-700 dark:text-slate-300">{sess.ipAddress || "182.253.110.45"}</strong>
                      </div>
                      <div className="text-right">
                        Device ID: <span className="font-mono">{sess.deviceId.slice(0, 14)}...</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500">
                  Tidak ada sesi perangkat yang tercatat.
                </div>
              )}

              {/* Warning note */}
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-[11px] leading-relaxed">
                Jika siswa terindikasi membagikan kata sandi (account sharing) kepada orang lain, tekan tombol di bawah untuk mencabut seluruh izin token login secara instan.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => handleForceLogout(selectedStudent.id)}
                disabled={isResetting}
                className="btn-interactive px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
              >
                {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                Reset Sesi Perangkat (Force Logout)
              </button>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

