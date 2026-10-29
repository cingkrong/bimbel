"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Loader2, XCircle, ArrowLeft, Smartphone } from "lucide-react";

function WaitingApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const [status, setStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | "EXPIRED">("PENDING");

  useEffect(() => {
    if (!requestId) {
      router.push("/login");
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/login-status?requestId=${requestId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "APPROVED") {
            setStatus("APPROVED");
            clearInterval(interval);
            setTimeout(() => {
              router.push("/tryout");
              router.refresh();
            }, 1000);
          } else if (data.status === "REJECTED") {
            setStatus("REJECTED");
            clearInterval(interval);
          } else if (data.status === "EXPIRED") {
            setStatus("EXPIRED");
            clearInterval(interval);
          }
        }
      } catch {
        // Retry next tick
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [requestId, router]);

  return (
    <div className="w-full max-w-md text-center space-y-6 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 p-8 shadow-xl">
      {status === "PENDING" && (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Menunggu Persetujuan Login
          </h2>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 space-y-2 text-left">
            <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <Smartphone className="w-4 h-4 text-rose-600" />
              <span>Akun Anda sedang aktif di perangkat lain.</span>
            </div>
            <p>
              Notifikasi persetujuan telah dikirimkan ke perangkat utama Anda. Silakan klik tombol <b>"Izinkan & Keluar"</b> pada perangkat tersebut untuk melanjutkan login di browser ini.
            </p>
            <div className="text-[11px] text-slate-400 pt-1 font-mono">
              Request ID: {requestId?.slice(0, 8)}...
            </div>
          </div>

          <div className="text-xs text-slate-400 animate-pulse">
            Memeriksa konfirmasi setiap 3 detik...
          </div>
        </div>
      )}

      {status === "APPROVED" && (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-emerald-600">
            Akses Disetujui!
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Sesi berhasil dialihkan ke perangkat ini. Mengarahkan Anda ke halaman Tryout CAT...
          </p>
        </div>
      )}

      {status === "REJECTED" && (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-rose-600">
            Akses Ditolak
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Permintaan login ditolak dari perangkat utama Anda.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="btn-interactive px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Kembali ke Halaman Login
            </Link>
          </div>
        </div>
      )}

      {status === "EXPIRED" && (
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 mx-auto flex items-center justify-center">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-amber-600">
            Waktu Persetujuan Habis
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Permintaan persetujuan telah kedaluwarsa setelah 5 menit tanpa respons.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="btn-interactive px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900"
            >
              Coba Login Ulang
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WaitingApprovalPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-rose-600" />}>
        <WaitingApprovalContent />
      </Suspense>
    </div>
  );
}
