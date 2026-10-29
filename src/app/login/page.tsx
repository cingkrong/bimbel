"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOrCreateDeviceId, getClientDeviceInfo } from "@/lib/device";
import { GraduationCap, ShieldAlert, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState("siswa@loloskampus.com");
  const [password, setPassword] = useState("password123");
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
        router.push("/tryout");
        router.refresh();
      }
    } catch {
      setErrorMsg("Terjadi gangguan koneksi jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30 mb-4">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Masuk ke Portal LolosKampus
        </h2>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
          Akses simulasi ujian CAT BKN SKD Kedinasan & CPNS 2026
        </p>
      </div>

      {reason === "session_transferred" && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <span>
            Sesi Anda telah dialihkan ke perangkat baru sesuai persetujuan. Silakan login kembali jika ingin menggunakan perangkat ini.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Alamat Email Siswa
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nama@email.com"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Kata Sandi
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
          <div className="font-semibold text-slate-800 dark:text-slate-200">Kredensial Demo:</div>
          <div>Siswa: <code className="text-rose-600 font-bold">siswa@loloskampus.com</code> / <code className="text-rose-600 font-bold">password123</code></div>
          <div>Admin: <code className="text-slate-600 font-bold">admin@loloskampus.com</code> / <code className="text-slate-600 font-bold">password123</code></div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-interactive w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-600/20"
        >
          {loading ? "Memverifikasi Perangkat..." : "Masuk ke Sistem CAT"}
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400">
        Belum punya akun?{" "}
        <Link href="/paket" className="font-semibold text-rose-600 hover:text-rose-700">
          Daftar & Pilih Paket Bimbel
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-rose-600" />}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
