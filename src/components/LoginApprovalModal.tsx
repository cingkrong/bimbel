"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function LoginApprovalModal() {
  const router = useRouter();
  const pathname = usePathname();
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Never poll for student login approvals when inside admin portal
    if (pathname.startsWith("/admin")) return;

    // Poll for pending login approval requests every 4 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/pending-approval");
        if (res.ok) {
          const data = await res.json();
          if (data.hasPending) {
            setPendingRequest(data.request);
          } else {
            setPendingRequest(null);
          }
        }
      } catch {
        // Silent catch for background poller
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (pathname.startsWith("/admin") || !pendingRequest) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/auth/approve-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: pendingRequest.id }),
      });
      if (res.ok) {
        setPendingRequest(null);
        router.push("/login?reason=session_transferred");
        router.refresh();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await fetch("/api/auth/reject-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: pendingRequest.id }),
      });
      setPendingRequest(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 p-6 shadow-2xl">
        <div className="flex items-center gap-3 text-amber-500 mb-4">
          <div className="p-2 rounded-full bg-amber-500/10">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Konfirmasi Akses Perangkat Baru
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sistem Anti-Account Sharing LolosKampus
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 text-sm space-y-2 mb-5">
          <p className="text-slate-700 dark:text-slate-300">
            Seseorang mencoba login ke akun Anda dengan informasi berikut:
          </p>
          <div className="text-xs space-y-1 font-mono text-slate-600 dark:text-slate-400 pt-1">
            <div><span className="text-slate-400">Perangkat:</span> {pendingRequest.newDeviceInfo || "Browser Web"}</div>
            <div><span className="text-slate-400">IP Address:</span> {pendingRequest.ipAddress || "127.0.0.1"}</div>
            <div><span className="text-slate-400">Waktu:</span> {new Date(pendingRequest.createdAt).toLocaleTimeString("id-ID")}</div>
          </div>
          <p className="text-xs text-rose-500 font-medium pt-2">
            ⚠️ Jika Anda menyetujui, sesi Anda di perangkat ini akan segera diakhiri.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleReject}
            disabled={isProcessing}
            className="btn-interactive px-4 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
          >
            <XCircle className="w-4 h-4 mr-1 text-slate-400" />
            Tolak Akses
          </button>
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="btn-interactive px-4 py-2 text-xs rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md shadow-rose-600/20"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            {isProcessing ? "Memproses..." : "Izinkan & Keluar"}
          </button>
        </div>
      </div>
    </div>
  );
}

