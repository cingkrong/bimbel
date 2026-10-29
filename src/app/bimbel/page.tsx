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
  Sparkles
} from "lucide-react";

export default function BimbelLMSPage() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [attendanceMsg, setAttendanceMsg] = useState("");

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
        setAttendanceMsg("Presensi kehadiran berhasil dicatat! Membuka tautan kelas...");
        if (meetingUrl) {
          window.open(meetingUrl, "_blank");
        }
        setTimeout(() => setAttendanceMsg(""), 3000);
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

  const primaryClass = classes[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/40 mb-2">
            <Video className="w-3.5 h-3.5" />
            Live Learning Management System (LMS)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Kelas Bimbel Intensif PKN STAN & Kedinasan 2026
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Jadwal tatap muka daring interaktif via Zoom, arsip rekaman materi video full HD, dan lembar tugas mandiri terstruktur.
          </p>
        </div>

        {primaryClass && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10">
            <img
              src={primaryClass.tutorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
              alt="Tutor"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Master Tutor</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{primaryClass.tutorName}</div>
            </div>
          </div>
        )}
      </div>

      {attendanceMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{attendanceMsg}</span>
        </div>
      )}

      {primaryClass ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Live Class Schedules (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-600" />
                Jadwal Live Zoom Interaktif
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                {primaryClass.schedules?.length || 0} Sesi Terjadwal
              </span>
            </div>

            <div className="space-y-4">
              {primaryClass.schedules?.map((sched: any, idx: number) => {
                const startTime = new Date(sched.startTime);
                const hasAttended = sched.attendances?.length > 0;

                return (
                  <div
                    key={sched.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 dark:bg-rose-950/40 text-rose-600">
                          Sesi #{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {startTime.toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          • {startTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {sched.topic}
                      </h3>

                      {hasAttended && (
                        <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> Presensi Kehadiran Tercatat
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleJoinClass(sched.id, sched.meetingUrl)}
                      className={`btn-interactive px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm ${
                        hasAttended
                          ? "bg-slate-900 hover:bg-slate-800 text-white"
                          : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
                      }`}
                    >
                      <Video className="w-4 h-4 mr-1.5" />
                      {hasAttended ? "Masuk Ulang Zoom" : "Masuk Kelas Zoom"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Assignments Section */}
            <div className="pt-6 space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-rose-600" />
                Tugas Mandiri & Lembar Kerja
              </h2>

              <div className="space-y-3">
                {primaryClass.assignments?.map((asg: any) => (
                  <div
                    key={asg.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {asg.title}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600">
                        Deadline: {new Date(asg.deadline).toLocaleDateString("id-ID")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {asg.instruction}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-medium text-amber-600">
                        Status: Belum Dikumpulkan
                      </span>
                      <button className="btn-interactive px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5">
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        Unggah Jawaban PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Class Video Recordings (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-rose-600" />
              Arsip Rekaman Kelas HD
            </h2>

            <div className="space-y-4">
              {primaryClass.recordings?.map((rec: any) => (
                <div
                  key={rec.id}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark overflow-hidden shadow-sm"
                >
                  <div className="relative aspect-video bg-slate-900 flex items-center justify-center group cursor-pointer">
                    <iframe
                      src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
                      title={rec.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      className="w-full h-full border-0"
                    />
                  </div>

                  <div className="p-4 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Durasi: {rec.durationText || "1 Jam"}</span>
                      <span className="text-rose-600 font-semibold">1080p Full HD</span>
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                      {rec.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-sm text-slate-500">Belum ada kelas bimbel yang aktif saat ini.</p>
        </div>
      )}
    </div>
  );
}

