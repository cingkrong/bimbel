"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Users,
  Database,
  DollarSign
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("superadmin@loloskampus.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal masuk sebagai admin.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setErrorMsg("Terjadi gangguan koneksi server.");
      setLoading(false);
    }
  };

  const handleSelectRolePreset = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30 mb-2">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            LolosKampus Operations Hub
          </h1>
          <p className="text-xs text-slate-400">
            Pusat kendali manajemen akademik, CBT CAT BKN, dan operasional finansial
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="rounded-3xl border border-slate-800 bg-slate-800/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-5">
          {/* Role Presets Selector */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Role Switcher (Pengujian RBAC):
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSelectRolePreset("superadmin@loloskampus.com")}
                className={`p-2 rounded-lg border text-left transition-all ${
                  email === "superadmin@loloskampus.com"
                    ? "border-rose-500 bg-rose-500/20 text-white font-bold"
                    : "border-slate-700 hover:border-slate-600 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-rose-400 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" /> Superadmin
                </div>
                <div className="text-[10px] text-slate-400">Full Access</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRolePreset("akademik@loloskampus.com")}
                className={`p-2 rounded-lg border text-left transition-all ${
                  email === "akademik@loloskampus.com"
                    ? "border-blue-500 bg-blue-500/20 text-white font-bold"
                    : "border-slate-700 hover:border-slate-600 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-blue-400 text-[11px]">
                  <Database className="w-3.5 h-3.5" /> Tim Akademik
                </div>
                <div className="text-[10px] text-slate-400">Bank Soal & Tryout</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRolePreset("tutor@loloskampus.com")}
                className={`p-2 rounded-lg border text-left transition-all ${
                  email === "tutor@loloskampus.com"
                    ? "border-emerald-500 bg-emerald-500/20 text-white font-bold"
                    : "border-slate-700 hover:border-slate-600 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px]">
                  <Users className="w-3.5 h-3.5" /> Master Tutor
                </div>
                <div className="text-[10px] text-slate-400">Kelas Zoom & Tugas</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRolePreset("finance@loloskampus.com")}
                className={`p-2 rounded-lg border text-left transition-all ${
                  email === "finance@loloskampus.com"
                    ? "border-amber-500 bg-amber-500/20 text-white font-bold"
                    : "border-slate-700 hover:border-slate-600 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px]">
                  <DollarSign className="w-3.5 h-3.5" /> Finance
                </div>
                <div className="text-[10px] text-slate-400">Transaksi & Payout</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-700">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-interactive w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2"
            >
              {loading ? "Memvalidasi Akses RBAC..." : "Masuk ke Dashboard Operasional"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

