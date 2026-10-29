"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import {
  CreditCard,
  Tag,
  Share2,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Search,
  Filter,
  Loader2,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  X
} from "lucide-react";

interface Transaction {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paymentChannel: string;
  status: "PAID" | "PENDING" | "EXPIRED" | "CANCELLED";
  createdAt: string;
  paidAt?: string | null;
  user: {
    username: string;
    email: string;
    profile?: { fullName: string; phone?: string | null } | null;
  };
  items: { product: { name: string }; price: number }[];
}

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  maxUsage: number | null;
  usageCount: number;
  validUntil: string | null;
  isActive: boolean;
}

interface Payout {
  id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: "PENDING" | "PAID" | "REJECTED";
  createdAt: string;
  user: { username: string; profile?: { fullName: string } | null };
  referralCode?: { code: string } | null;
}

function TransaksiContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "TRANSACTIONS";

  const [activeTab, setActiveTab] = useState<"TRANSACTIONS" | "COUPONS" | "PAYOUTS">(
    initialTab === "coupons" ? "COUPONS" : initialTab === "payouts" ? "PAYOUTS" : "TRANSACTIONS"
  );

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [txStatus, setTxStatus] = useState<string>("ALL");

  // Modal Coupon
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [couponValue, setCouponValue] = useState(20);
  const [couponMaxUsage, setCouponMaxUsage] = useState(100);
  const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const url = txStatus === "ALL" ? "/api/admin/transactions" : `/api/admin/transactions?status=${txStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setTransactions(json.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const json = await res.json();
        setCoupons(json.coupons || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payouts");
      if (res.ok) {
        const json = await res.json();
        setPayouts(json.payouts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "TRANSACTIONS") fetchTransactions();
    if (activeTab === "COUPONS") fetchCoupons();
    if (activeTab === "PAYOUTS") fetchPayouts();
  }, [activeTab, txStatus]);

  const handleManualVerify = async (txId: string) => {
    if (!confirm("Konfirmasi verifikasi manual transaksi ini menjadi LUNAS (PAID)?")) return;
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txId }),
      });
      if (res.ok) {
        fetchTransactions();
      }
    } catch (err) {
      alert("Gagal memverifikasi transaksi");
    }
  };

  const handleConfirmPayout = async (payoutId: string) => {
    if (!confirm("Konfirmasi transfer dana komisi afiliasi telah berhasil dikirim ke mitra?")) return;
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId }),
      });
      if (res.ok) {
        fetchPayouts();
      }
    } catch (err) {
      alert("Gagal memproses pembayaran komisi");
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsSubmittingCoupon(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          discountType: couponType,
          discountValue: couponValue,
          maxUsage: couponMaxUsage,
        }),
      });
      if (res.ok) {
        setIsCreateCouponOpen(false);
        setCouponCode("");
        fetchCoupons();
      }
    } catch (err) {
      alert("Gagal membuat kupon diskon");
    } finally {
      setIsSubmittingCoupon(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Keuangan, Transaksi, Kupon & Komisi Afiliasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pantau arus kas masuk, manual payment override, kode promo marketing, dan penarikan komisi referral.
          </p>
        </div>

        {activeTab === "COUPONS" && (
          <button
            onClick={() => setIsCreateCouponOpen(true)}
            className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-emerald-600 text-xs font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Buat Kupon Diskon Baru
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 text-xs">
        {[
          { id: "TRANSACTIONS", label: "Monitoring Invoice Transaksi", icon: CreditCard },
          { id: "COUPONS", label: "Manajemen Kupon Diskon", icon: Tag },
          { id: "PAYOUTS", label: "Pencairan Komisi Afiliasi", icon: Share2 },
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

      {/* Tab 1: Transactions */}
      {activeTab === "TRANSACTIONS" && (
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10 text-xs w-fit">
            {[
              { id: "ALL", label: "Semua Transaksi" },
              { id: "PAID", label: "Lunas (PAID)" },
              { id: "PENDING", label: "Menunggu Pembayaran" },
              { id: "EXPIRED", label: "Kedaluwarsa" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTxStatus(f.id)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  txStatus === f.id
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <p className="text-xs text-slate-400">Memuat rekap transaksi...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Tidak ada riwayat transaksi dengan status ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4 w-40">No. Invoice</th>
                      <th className="py-3 px-4 w-36">Waktu Transaksi</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">Paket / Produk</th>
                      <th className="py-3 px-4 w-32">Kanal Bayar</th>
                      <th className="py-3 px-4 w-32 text-right">Nominal</th>
                      <th className="py-3 px-4 w-28 text-center">Status</th>
                      <th className="py-3 px-4 w-36 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {tx.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {new Date(tx.createdAt).toLocaleString("id-ID", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {tx.user.profile?.fullName || tx.user.username}
                          </div>
                          <div className="text-[10px] text-slate-400">{tx.user.email}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {tx.items[0]?.product?.name || "Paket Bimbel & Tryout CAT"}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400">
                          {tx.paymentChannel}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatRupiah(tx.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              tx.status === "PAID"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : tx.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {tx.status === "PENDING" ? (
                            <button
                              onClick={() => handleManualVerify(tx.id)}
                              className="btn-interactive px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
                            >
                              Verifikasi Manual
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 flex items-center justify-end gap-1 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Lunas
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Coupons */}
      {activeTab === "COUPONS" && (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : !coupons.length ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada kupon promo aktif. Klik tombol di atas untuk menambah kode kupon baru.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-40">Kode Promo</th>
                    <th className="py-3 px-4 w-36">Besar Potongan</th>
                    <th className="py-3 px-4 w-36 text-center">Penggunaan</th>
                    <th className="py-3 px-4 w-48">Masa Berlaku</th>
                    <th className="py-3 px-4 w-28 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {coupons.map((cpn) => (
                    <tr key={cpn.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm tracking-wide">
                        {cpn.code}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {cpn.discountType === "PERCENT"
                          ? `${cpn.discountValue}% Diskon`
                          : formatRupiah(cpn.discountValue)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {cpn.usageCount} / {cpn.maxUsage || "∞"} Kuota
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {cpn.validUntil
                          ? new Date(cpn.validUntil).toLocaleDateString("id-ID", { dateStyle: "long" })
                          : "Permanen (Tanpa Batas)"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          AKTIF
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Payouts */}
      {activeTab === "PAYOUTS" && (
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : !payouts.length ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Tidak ada antrean penarikan komisi afiliasi siswa.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-36">Waktu Request</th>
                    <th className="py-3 px-4">Nama Mitra Siswa</th>
                    <th className="py-3 px-4">Bank & Rekening Tujuan</th>
                    <th className="py-3 px-4 w-36 text-right">Jumlah Saldo</th>
                    <th className="py-3 px-4 w-28 text-center">Status</th>
                    <th className="py-3 px-4 w-44 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {payouts.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(pay.createdAt).toLocaleDateString("id-ID", {
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {pay.user.profile?.fullName || pay.user.username}
                        <div className="text-[10px] text-indigo-500 font-mono">
                          Ref: {pay.referralCode?.code || "STAN"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {pay.bankName} - {pay.accountNumber}
                        </div>
                        <div className="text-[10px] text-slate-400">a.n. {pay.accountHolder}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(pay.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            pay.status === "PAID"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }`}
                        >
                          {pay.status === "PAID" ? "DITRANSFER" : "PENDING"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {pay.status === "PENDING" ? (
                          <button
                            onClick={() => handleConfirmPayout(pay.id)}
                            className="btn-interactive px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                          >
                            Konfirmasi Transfer
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 flex items-center justify-end gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Selesai
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Buat Kupon Diskon */}
      {isCreateCouponOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                Buat Kupon Promo Diskon Baru
              </h2>
              <button onClick={() => setIsCreateCouponOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kode Promo (Uppercase) *
                </label>
                <input
                  type="text"
                  placeholder="cth: DISKONSTAN20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono uppercase font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipe Diskon
                  </label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                  >
                    <option value="PERCENT">Persentase (%)</option>
                    <option value="FIXED">Nominal Tetap (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nilai Diskon
                  </label>
                  <input
                    type="number"
                    value={couponValue}
                    onChange={(e) => setCouponValue(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Maksimal Kuota Pemakaian Siswa
                </label>
                <input
                  type="number"
                  value={couponMaxUsage}
                  onChange={(e) => setCouponMaxUsage(parseInt(e.target.value, 10) || 100)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateCouponOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCoupon}
                  className="btn-interactive px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Simpan Kupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransaksiAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      }
    >
      <TransaksiContent />
    </Suspense>
  );
}

