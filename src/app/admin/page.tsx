"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  Users,
  Trophy,
  Target,
  Flag,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  Loader2
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const salesTrend = data?.salesTrend || [];
  const subtestDistribution = data?.subtestDistribution || [];
  const recentTransactions = data?.recentTransactions || [];
  const recentAuditLogs = data?.recentAuditLogs || [];

  return (
    <div className="space-y-8">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Ringkasan Eksekutif & Operasional
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau arus kas, aktivitas CAT BKN, sesi aktif siswa, dan moderasi soal secara terpadu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/bank-soal"
            className="btn-interactive px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-rose-600 text-xs font-bold shadow-sm"
          >
            + Tambah Butir Soal
          </Link>
          <Link
            href="/admin/tryout"
            className="btn-interactive px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            Rakit Paket Tryout
          </Link>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total GMV */}
        <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Omzet (GMV)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {formatRupiah(kpis.totalGMV || 0)}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Transaksi Terverifikasi
          </div>
        </div>

        {/* Total Active Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Siswa Terdaftar</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {kpis.totalStudents || 0}
          </div>
          <div className="text-[11px] font-semibold text-blue-600">
            +{kpis.newStudentsToday || 0} Siswa Baru Hari Ini
          </div>
        </div>

        {/* Tryouts Completed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Sesi Ujian Selesai</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {kpis.totalTryoutsCompleted || 0}
          </div>
          <div className="text-[11px] text-slate-500">
            Simulasi CAT BKN Berjalan
          </div>
        </div>

        {/* Passing Grade Ratio */}
        <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Kelulusan PG</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
            {kpis.avgPassRate || 0}%
          </div>
          <div className="text-[11px] text-slate-500">
            Rasio Lolos Nilai Ambang Batas
          </div>
        </div>

        {/* Open Reports */}
        <div className="p-5 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Laporan Butir Soal</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
              <Flag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 tabular-nums">
            {kpis.openQuestionReports || 0} Tiket
          </div>
          <Link
            href="/admin/laporan-soal"
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 block"
          >
            Review Tiket Komplain →
          </Link>
        </div>
      </div>

      {/* Charts Section: Revenue Area & Subtest Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Tren Pendapatan Penjualan Paket (14 Hari Terakhir)
              </h2>
              <p className="text-[11px] text-slate-500">
                Arus kas masuk dari pembelian paket Tryout, Bimbel, dan Bundling
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
              Total GMV: {formatRupiah(kpis.totalGMV || 0)}
            </span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  formatter={(val: any) => [formatRupiah(Number(val)), "Pendapatan"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subtest Completion Bar (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-white/5">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Volume Pengerjaan Butir Soal CAT BKN
            </h2>
            <p className="text-[11px] text-slate-500">
              Distribusi jawaban tersimpan pada masing-masing subtes
            </p>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subtestDistribution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="subtest" tick={{ fontSize: 9, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  formatter={(val: any) => [`${val} Butir Soal`, "Total Terjawab"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#fff", fontSize: "11px" }}
                />
                <Bar dataKey="totalItemsAnswered" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Transactions Table (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Transaksi Pembayaran Terbaru
              </h2>
              <p className="text-[11px] text-slate-500">
                Aktivitas checkout siswa real-time
              </p>
            </div>
            <Link
              href="/admin/transaksi"
              className="text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              Lihat Semua Transaksi →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 dark:bg-white/5">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Invoice</th>
                  <th className="py-2.5 px-3">Siswa</th>
                  <th className="py-2.5 px-3">Paket</th>
                  <th className="py-2.5 px-3">Metode</th>
                  <th className="py-2.5 px-3">Nominal</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {recentTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {tx.invoiceNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{tx.buyer}</div>
                      <div className="text-[10px] text-slate-400">{tx.email}</div>
                    </td>
                    <td className="py-3 px-3 max-w-[150px] truncate" title={tx.productName}>
                      {tx.productName}
                    </td>
                    <td className="py-3 px-3 uppercase font-mono text-[11px] text-slate-500">
                      {tx.paymentChannel}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold tabular-nums">
                      {formatRupiah(tx.totalAmount)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          tx.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : tx.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live System Activity & Audit Logs (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Audit Log Aktivitas
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
          </div>

          <div className="space-y-3">
            {recentAuditLogs.map((log: any) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Oleh: <b className="text-slate-700 dark:text-slate-300">{log.admin.name}</b> ({log.admin.role})
                </div>
              </div>
            ))}

            {recentAuditLogs.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">
                Belum ada catatan log aktivitas.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

