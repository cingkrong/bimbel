"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import {
  User,
  Share2,
  DollarSign,
  Copy,
  Check,
  Award,
  Settings,
  GraduationCap,
  LogOut,
  Loader2
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleCopyReferral = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText("https://app.loloskampus.com/paket?ref=FAJARSTAN2026");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* Profile Card Header */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-rose-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-rose-600/20">
            {user.username?.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {user.profile?.fullName || user.username}
            </h1>
            <div className="text-xs text-slate-500 font-mono">{user.email}</div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 mt-1">
              <GraduationCap className="w-3.5 h-3.5 text-rose-600" />
              Target: {user.profile?.targetSchool || "PKN STAN 2026"}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-interactive px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/10 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          Keluar dari Akun
        </button>
      </div>

      {/* Referral & Affiliate Section */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                Program Afiliasi & Referral Siswa
              </h2>
              <p className="text-xs text-slate-500">
                Ajak rekan pejuang kedinasan dan dapatkan komisi 10% setiap transaksi.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
            Komisi Aktif 10%
          </span>
        </div>

        {/* Commission Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
            <div className="text-xs text-slate-500">Total Komisi Didapatkan</div>
            <div className="text-xl font-black text-emerald-600 tabular-nums mt-1">
              {formatRupiah(75000)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
            <div className="text-xs text-slate-500">Jumlah Siswa Terdaftar</div>
            <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
              3 Siswa
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
            <div className="text-xs text-slate-500">Kode Referral Anda</div>
            <div className="text-xl font-mono font-black text-rose-600 mt-1">
              FAJARSTAN2026
            </div>
          </div>
        </div>

        {/* Share Link Input */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full truncate font-mono text-xs text-slate-600 dark:text-slate-300">
            https://app.loloskampus.com/paket?ref=FAJARSTAN2026
          </div>
          <button
            onClick={handleCopyReferral}
            className="btn-interactive px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold whitespace-nowrap shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1 text-emerald-500" />
                Tersalin!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Salin Tautan Afiliasi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

