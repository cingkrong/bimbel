"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Video,
  FileCheck,
  Clock,
  ExternalLink,
  CheckCircle,
  PlayCircle,
  Upload,
  UserCheck,
  Loader2,
  Sparkles,
  BookOpen,
  AlertCircle,
  Award,
  ChevronRight
} from "lucide-react";

export default function BimbelLMSPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [attendanceMsg, setAttendanceMsg] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await fetch("/api/bimbel/classes");
        if (res.ok) {
          const data = await res.json();
          setClasses(data.classes || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, []);

  const handleJoinClass = async (scheduleId: string, meetingUrl?: string) => {
    try {
      const res = await fetch("/api/bimbel/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId }),
      });

      if (res.ok) {
        setAttendanceMsg("Presensi kehadiran tercatat! Menghubungkan ke ruang Zoom...");
        if (meetingUrl) {
          window.open(meetingUrl, "_blank");
        }
        setTimeout(() => setAttendanceMsg(""), 4000);
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
          <span className="text-xs font-semibold text-slate-500">Memuat Jadwal Kelas & Materi LMS...</span>
        </div>
      </div>
    );
  }

  const primaryClass = classes[0];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-canvas-dark text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Background Dot Matrix Pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30 dark:opacity-15 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/80 dark:border-white/10 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40">
              <Video className="w-3.5 h-3.5" />
              Live Learning Management System (LMS)
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Bimbel Intensif SKD Kedinasan & CPNS 2026
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Jadwal tatap muka daring interaktif via Zoom, arsip rekaman video 1080p dengan trik pengerjaan cepat, dan modul lembar kerja mandiri.
            </p>
          </div>

          {primaryClass && (
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-white/10 shadow-sm flex-shrink-0">
              <div className="relative">
                <img
                  src={primaryClass.tutorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                  alt="Tutor"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-rose-500/20"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-surface-dark flex items-center justify-center">
                  <CheckCircle className="w-2.5 h-2.5 text-white" />
                </span>
              </div>
              <div>
                <div className="text-[10px] uppercase font-extrabold text-rose-600 dark:text-rose-400 tracking-wider">
                  Master Tutor Terverifikasi
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {primaryClass.tutorName}
                </div>
                <div className="text-[11px] text-slate-500">
                  Spesialis Trik TIU & Penalaran Logis
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Attendance Alert */}
        {attendanceMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-3 shadow-xs animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{attendanceMsg}</span>
          </div>
        )}

        {primaryClass ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Live Class Schedules & Assignments (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Schedules Card Group */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-600" />
                    Jadwal Live Zoom Mendatang
                  </h2>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
                    {primaryClass.schedules?.length || 0} Sesi Aktif
                  </span>
                </div>

                <div className="space-y-3.5">
                  {primaryClass.schedules?.map((sched: any, idx: number) => {
                    const startTime = new Date(sched.startTime);
                    const hasAttended = sched.attendances?.length > 0;
                    const dayName = startTime.toLocaleDateString("id-ID", { weekday: "short" });
                    const dateNum = startTime.getDate();
                    const monthName = startTime.toLocaleDateString("id-ID", { month: "short" });
                    const timeStr = startTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div
                        key={sched.id}
                        className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="flex items-start gap-4">
                          {/* Calendar Date Badge */}
                          <div className="w-12 h-14 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-[10px] uppercase font-bold text-rose-600">{dayName}</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{dateNum}</span>
                            <span className="text-[9px] uppercase font-semibold text-slate-500">{monthName}</span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 dark:bg-rose-950/50 text-rose-600">
                                Sesi #{idx + 1}
                              </span>
                              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {timeStr} WIB (90 Menit)
                              </span>
                            </div>

                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                              {sched.topic}
                            </h3>

                            {hasAttended ? (
                              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5 pt-0.5">
                                <UserCheck className="w-3.5 h-3.5" /> Presensi Kehadiran Tercatat
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400">
                                Ruang Zoom dibuka 10 menit sebelum sesi dimulai
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleJoinClass(sched.id, sched.meetingUrl)}
                          className={`btn-interactive px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm flex items-center justify-center gap-2 flex-shrink-0 ${
                            hasAttended
                              ? "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/10 dark:hover:bg-white/15"
                              : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25"
                          }`}
                        >
                          <Video className="w-4 h-4" />
                          {hasAttended ? "Masuk Ulang Zoom" : "Gabung Zoom Kelas"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assignments Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-rose-600" />
                    Tugas Mandiri & Lembar Kerja
                  </h2>
                  <span className="text-xs text-slate-500">Evaluasi Langsung Tutor</span>
                </div>

                <div className="space-y-3">
                  {primaryClass.assignments?.map((asg: any) => (
                    <div
                      key={asg.id}
                      className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {asg.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {asg.instruction}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 whitespace-nowrap flex-shrink-0">
                          Batas: {new Date(asg.deadline).toLocaleDateString("id-ID")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                        <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Status: Belum Mengunggah Jawaban
                        </span>
                        <button className="btn-interactive px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                          <Upload className="w-3.5 h-3.5" />
                          Unggah File PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Class Video Recordings (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-rose-600" />
                  Arsip Rekaman Sesi Video HD
                </h2>
                <span className="text-xs text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                  1080p Full HD
                </span>
              </div>

              <div className="space-y-4">
                {primaryClass.recordings?.map((rec: any) => (
                  <div
                    key={rec.id}
                    className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-surface-dark overflow-hidden shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all group"
                  >
                    <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                      <iframe
                        src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
                        title={rec.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        className="w-full h-full border-0"
                      />
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Durasi: {rec.durationText || "1 Jam 30 Menit"}
                        </span>
                        <span className="font-semibold text-emerald-600">Akses Unlimited</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-snug group-hover:text-rose-600 transition-colors">
                        {rec.title}
                      </h3>
                      <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-100 dark:border-white/5">
                        <span className="text-slate-400">Termasuk lembar rumus & ringkasan PPT</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 rounded-3xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-white/10 p-8 space-y-4">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Belum Ada Kelas Bimbel yang Aktif
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Akses kelas bimbel intensif tersedia bagi pengguna yang telah mengambil paket Bimbel atau Bundling LolosKampus.
            </p>
            <Link
              href="/paket"
              className="btn-interactive inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
            >
              Lihat Pilihan Paket Bimbel
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
