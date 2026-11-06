"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOrCreateDeviceId, getClientDeviceInfo } from "@/lib/device";
import { trackMetaClientEvent } from "@/components/analytics/MetaPixelProvider";
import {
  GraduationCap,
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  ShieldCheck
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("siswa@loloskampus.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    setDeviceId(getOrCreateDeviceId());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const activeDevId = deviceId || getOrCreateDeviceId();
      const deviceInfo = getClientDeviceInfo();

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          deviceId: activeDevId,
          deviceInfo,
          source: "web_student",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Gagal masuk. Periksa email dan password Anda.");
        setLoading(false);
        return;
      }

      if (data.status === "REQUIRES_APPROVAL") {
        router.push(`/login/waiting-approval?requestId=${data.requestId}`);
        return;
      }

      if (data.status === "SUCCESS") {
        trackMetaClientEvent("CompleteRegistration", {
          content_name: "Student Portal Login",
          status: "success",
        });
        router.push("/tryout");
        router.refresh();
      }
    } catch {
      setErrorMsg("Terjadi gangguan koneksi jaringan.");
      setLoading(false);
    }
  };

  const fillDemo = (role: "siswa" | "admin") => {
    if (role === "siswa") {
      setEmail("siswa@loloskampus.com");
      setPassword("password123");
    } else {
      setEmail("admin@loloskampus.com");
      setPassword("password123");
    }
    setErrorMsg("");
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand Icon & Heading */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30 mb-2 ring-4 ring-rose-500/10">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Masuk Portal Siswa
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Akses simulasi ujian CAT BKN SKD Kedinasan & CPNS 2026
        </p>
      </div>

      {/* Login Card */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-xl space-y-6">
        {reason === "session_transferred" && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <span>
              Sesi Anda telah dialihkan ke perangkat baru. Silakan login kembali jika ingin menggunakan perangkat ini.
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick-fill Pills */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Akun Percobaan (1-Click Fill):
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemo("siswa")}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                email.includes("siswa")
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-900/40"
                  : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-white/10 hover:bg-slate-100"
              }`}
            >
              Siswa Demo
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin")}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                email.includes("admin")
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-900/40"
                  : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-white/10 hover:bg-slate-100"
              }`}
            >
              Admin Demo
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nama@email.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-interactive w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Perangkat...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Sistem CAT</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-center text-xs text-slate-500">
          Belum memiliki paket belajar?{" "}
          <Link href="/paket" className="font-bold text-rose-600 hover:text-rose-700">
            Daftar & Pilih Paket Bimbel
          </Link>
        </div>
      </div>

      {/* Security Footnote */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Dilindungi enkripsi perangkat tunggal & deteksi sesi aktif</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-50 dark:bg-canvas-dark">
      {/* Background Dot Matrix & Spotlight */}
      <div className="absolute inset-0 bg-dot-pattern opacity-40 dark:opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-rose-500/10 dark:bg-rose-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-rose-600" />}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
