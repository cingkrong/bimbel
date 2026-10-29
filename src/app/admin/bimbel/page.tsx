"use client";

import { useEffect, useState } from "react";
import {
  Video,
  Calendar,
  FileCheck2,
  Film,
  Plus,
  Users,
  Clock,
  ExternalLink,
  CheckCircle2,
  X,
  Loader2,
  CalendarDays,
  FileText
} from "lucide-react";

interface Schedule {
  id: string;
  topic: string;
  startTime: string;
  endTime: string;
  meetingUrl: string | null;
  attendancesCount: number;
}

interface Assignment {
  id: string;
  title: string;
  instruction: string;
  deadline: string;
  submissionsCount: number;
}

interface Recording {
  id: string;
  title: string;
  videoUrl: string;
  durationText: string | null;
  sortOrder: number;
}

interface BimbelClass {
  id: string;
  title: string;
  description: string | null;
  tutorName: string;
  schedules: Schedule[];
  assignments: Assignment[];
  recordings: Recording[];
}

export default function BimbelAdminPage() {
  const [classes, setClasses] = useState<BimbelClass[]>([]);
  const [activeTab, setActiveTab] = useState<"SCHEDULES" | "ASSIGNMENTS" | "RECORDINGS">("SCHEDULES");
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [isAddRecordingOpen, setIsAddRecordingOpen] = useState(false);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Form states
  const [topic, setTopic] = useState("");
  const [startTime, setStartTime] = useState("2026-10-31T19:30");
  const [endTime, setEndTime] = useState("2026-10-31T21:30");
  const [meetingUrl, setMeetingUrl] = useState("https://zoom.us/j/9876543210?pwd=STAN");

  const [recTitle, setRecTitle] = useState("");
  const [recUrl, setRecUrl] = useState("");
  const [recDuration, setRecDuration] = useState("1 Jam 45 Menit");

  const [asgTitle, setAsgTitle] = useState("");
  const [asgInstruction, setAsgInstruction] = useState("");
  const [asgDeadline, setAsgDeadline] = useState("2026-11-05T23:59");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bimbel");
      if (res.ok) {
        const json = await res.json();
        setClasses(json.classes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const currentClass = classes[0];

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass || !topic.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/bimbel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_SCHEDULE",
          classId: currentClass.id,
          payload: {
            topic,
            startTime,
            endTime,
            meetingUrl,
          },
        }),
      });

      if (res.ok) {
        setIsAddScheduleOpen(false);
        setTopic("");
        fetchClasses();
      }
    } catch (err) {
      alert("Gagal menambahkan sesi Zoom");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass || !recTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/bimbel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_RECORDING",
          classId: currentClass.id,
          payload: {
            title: recTitle,
            videoUrl: recUrl,
            durationText: recDuration,
            sortOrder: (currentClass.recordings?.length || 0) + 1,
          },
        }),
      });

      if (res.ok) {
        setIsAddRecordingOpen(false);
        setRecTitle("");
        setRecUrl("");
        fetchClasses();
      }
    } catch (err) {
      alert("Gagal mengarsipkan rekaman video");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClass || !asgTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/bimbel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_ASSIGNMENT",
          classId: currentClass.id,
          payload: {
            title: asgTitle,
            instruction: asgInstruction,
            deadline: asgDeadline,
          },
        }),
      });

      if (res.ok) {
        setIsAddAssignmentOpen(false);
        setAsgTitle("");
        setAsgInstruction("");
        fetchClasses();
      }
    } catch (err) {
      alert("Gagal membuat tugas siswa");
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
            <Video className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            LMS & Operasional Bimbel Live Zoom
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Atur jadwal tatap muka daring, presensi siswa otomatis, tugas mingguan, dan repositori rekaman materi.
          </p>
        </div>

        {/* Action Button depends on active tab */}
        <div className="flex items-center gap-2">
          {activeTab === "SCHEDULES" && (
            <button
              onClick={() => setIsAddScheduleOpen(true)}
              className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-emerald-600 text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Jadwalkan Sesi Zoom Baru
            </button>
          )}
          {activeTab === "ASSIGNMENTS" && (
            <button
              onClick={() => setIsAddAssignmentOpen(true)}
              className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-emerald-600 text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Tugas Baru
            </button>
          )}
          {activeTab === "RECORDINGS" && (
            <button
              onClick={() => setIsAddRecordingOpen(true)}
              className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-emerald-600 text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Upload Link Rekaman
            </button>
          )}
        </div>
      </div>

      {/* Class Overview Pill */}
      {currentClass && (
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              Kelas Bimbel Aktif
            </span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {currentClass.title}
            </h2>
            <p className="text-xs text-slate-500">
              Pengajar: <strong className="text-slate-700 dark:text-slate-300">{currentClass.tutorName}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Module Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 text-xs">
        {[
          { id: "SCHEDULES", label: "Jadwal Kelas Live Zoom", icon: Calendar },
          { id: "ASSIGNMENTS", label: "Tugas Mandiri Siswa", icon: FileCheck2 },
          { id: "RECORDINGS", label: "Arsip Rekaman Pertemuan", icon: Film },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition-all ${
                isActive
                  ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Schedules */}
      {activeTab === "SCHEDULES" && (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : !currentClass?.schedules?.length ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada jadwal sesi kelas live. Klik "Jadwalkan Sesi Zoom Baru" untuk menambahkan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Topik Pembelajaran</th>
                    <th className="py-3 px-4 w-48">Waktu & Tanggal</th>
                    <th className="py-3 px-4 w-52">Tautan Zoom Meeting</th>
                    <th className="py-3 px-4 w-28 text-center">Kehadiran</th>
                    <th className="py-3 px-4 w-36 text-right">Presensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {currentClass.schedules.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {sch.topic}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {new Date(sch.startTime).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        {sch.meetingUrl ? (
                          <a
                            href={sch.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-semibold"
                          >
                            <Video className="w-3.5 h-3.5" />
                            Buka Link Zoom
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {sch.attendancesCount} Hadir
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedSchedule(sch);
                            setIsAttendanceModalOpen(true);
                          }}
                          className="btn-interactive px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-slate-700 dark:text-slate-300"
                        >
                          Buka Presensi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Assignments */}
      {activeTab === "ASSIGNMENTS" && (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
          {!currentClass?.assignments?.length ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada tugas mandiri siswa. Klik tombol di atas untuk membuat tugas baru.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Judul Tugas</th>
                    <th className="py-3 px-4">Instruksi</th>
                    <th className="py-3 px-4 w-40">Tenggat Waktu</th>
                    <th className="py-3 px-4 w-32 text-center">Submisi Siswa</th>
                    <th className="py-3 px-4 w-28 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {currentClass.assignments.map((asg) => (
                    <tr key={asg.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {asg.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 line-clamp-1 max-w-sm">
                        {asg.instruction}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-rose-600 dark:text-rose-400">
                        {new Date(asg.deadline).toLocaleDateString("id-ID", {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {asg.submissionsCount} Terkumpul
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert(`Review nilai tugas "${asg.title}" (Submisi: ${asg.submissionsCount} siswa).`)}
                          className="btn-interactive px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                        >
                          Review Nilai
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recordings */}
      {activeTab === "RECORDINGS" && (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
          {!currentClass?.recordings?.length ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada arsip rekaman video kelas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-20 text-center">Urutan</th>
                    <th className="py-3 px-4">Judul Rekaman Pertemuan</th>
                    <th className="py-3 px-4 w-36">Durasi</th>
                    <th className="py-3 px-4 w-48">Link Video</th>
                    <th className="py-3 px-4 w-24 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {currentClass.recordings.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        #{rec.sortOrder}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {rec.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {rec.durationText || "-"}
                      </td>
                      <td className="py-3.5 px-4">
                        <a
                          href={rec.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-indigo-600 hover:underline font-semibold"
                        >
                          <Film className="w-3.5 h-3.5" />
                          Putar Rekaman
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert("Pratinjau player video embedding rekaman...")}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Tambah Jadwal Zoom */}
      {isAddScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-600" />
                Jadwalkan Sesi Kelas Live Zoom
              </h2>
              <button onClick={() => setIsAddScheduleOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Materi / Topik Sesi *
                </label>
                <input
                  type="text"
                  placeholder="cth: Kupas Tuntas Logika TIU & Deret BKN"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mulai
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Selesai
                  </label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Link Tautan Zoom / Google Meet *
                </label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddScheduleOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-interactive px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Buka Presensi Siswa */}
      {isAttendanceModalOpen && selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Presensi: {selectedSchedule.topic}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Total {selectedSchedule.attendancesCount} siswa terverifikasi hadir.
                </p>
              </div>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
              {[
                { name: "Aditya Pratama Putra", time: "19:28 WIB", status: "Tepat Waktu" },
                { name: "Siti Nurhaliza", time: "19:30 WIB", status: "Tepat Waktu" },
                { name: "Rian Hidayatullah", time: "19:34 WIB", status: "Tepat Waktu" },
                { name: "Dewi Lestari", time: "19:42 WIB", status: "Terlambat (12m)" },
              ].map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{s.name}</p>
                    <p className="text-[10px] text-slate-400">{s.time}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {s.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAttendanceModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload Rekaman */}
      {isAddRecordingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-emerald-600" />
                Upload Tautan Rekaman Kelas
              </h2>
              <button onClick={() => setIsAddRecordingOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecording} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Rekaman Pertemuan *
                </label>
                <input
                  type="text"
                  placeholder="cth: Rekaman Pertemuan #3: Analisis TKP"
                  value={recTitle}
                  onChange={(e) => setRecTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tautan Video (YouTube Unlisted / Vimeo) *
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={recUrl}
                  onChange={(e) => setRecUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Durasi Video
                </label>
                <input
                  type="text"
                  placeholder="cth: 1 Jam 45 Menit"
                  value={recDuration}
                  onChange={(e) => setRecDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddRecordingOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-interactive px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Simpan Rekaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

