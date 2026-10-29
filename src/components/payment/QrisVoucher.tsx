"use client";

import { useState, useEffect } from "react";
import { formatRupiah } from "@/lib/utils";
import {
  Download,
  Copy,
  Check,
  Clock,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
  Loader2
} from "lucide-react";

interface QrisVoucherProps {
  invoiceNumber: string;
  totalAmount: number;
  qrCodeUrl: string;
  qrisString?: string;
  merchantName?: string;
  nmid?: string;
  merchantCity?: string;
  expiresAt?: string;
  onCheckStatus?: () => Promise<void> | void;
  checkingStatus?: boolean;
}

export function QrisVoucher({
  invoiceNumber,
  totalAmount,
  qrCodeUrl,
  qrisString,
  merchantName = "LOLOSKAMPUS BIMBEL CAT",
  nmid = "ID1024319802914",
  merchantCity = "JAKARTA",
  expiresAt,
  onCheckStatus,
  checkingStatus = false,
}: QrisVoucherProps) {
  const [copied, setCopied] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // default 15 minutes in seconds

  useEffect(() => {
    if (expiresAt) {
      const expiryTime = new Date(expiresAt).getTime();
      const calcRemaining = () => Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
      setTimeLeft(calcRemaining());
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const handleCopyString = () => {
    if (!qrisString) return;
    navigator.clipboard.writeText(qrisString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyInvoice = () => {
    navigator.clipboard.writeText(invoiceNumber);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2500);
  };

  const handleDownloadQr = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `QRIS-${invoiceNumber}.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* ==========================================
          OFFICIAL INDONESIAN QRIS PAYMENT VOUCHER
          ========================================== */}
      <div className="bg-white text-slate-900 rounded-3xl border-2 border-slate-200/90 shadow-2xl overflow-hidden font-sans">
        {/* RED QRIS OFFICIAL HEADER */}
        <div className="bg-[#ED1C24] px-5 py-3.5 flex items-center justify-between text-white border-b-2 border-red-700">
          <div className="flex items-center gap-2">
            {/* Standard QRIS typography mark */}
            <div className="flex items-baseline font-black tracking-tighter text-2xl leading-none">
              <span className="text-white">Q</span>
              <span className="text-white/95">RIS</span>
            </div>
            <div className="border-l border-white/40 pl-2 text-[8px] font-bold tracking-tight uppercase leading-tight">
              Standar Pembayaran
              <br />
              Nasional (ASPI/BI)
            </div>
          </div>

          {/* GPN (Gerbang Pembayaran Nasional) Logo Badge */}
          <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[10px] font-black text-slate-900 tracking-wider">GPN</span>
          </div>
        </div>

        {/* MERCHANT IDENTITY & NATIONAL REGISTRATION */}
        <div className="px-6 pt-5 pb-3 text-center space-y-1 border-b border-slate-100">
          <h3 className="text-base font-black tracking-tight text-slate-900 uppercase">
            {merchantName}
          </h3>
          <div className="text-[11px] font-mono text-slate-600 font-semibold tracking-wider">
            NMID : <span className="text-slate-900">{nmid}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            KOTA: {merchantCity} • TERMINAL: A01 (BIONPAY AGGREGATOR)
          </div>
        </div>

        {/* QR CODE DISPLAY FRAME */}
        <div className="p-6 bg-slate-50 flex flex-col items-center justify-center">
          <div className="relative p-3.5 bg-white rounded-2xl border-2 border-slate-300 shadow-md">
            {/* Target corner marks */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center bg-white">
              <img
                src={qrCodeUrl}
                alt="QRIS National Standard Payment Code"
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>

            {/* Micro center badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-8 h-8 rounded-lg bg-white/95 border border-red-500/40 shadow-sm flex items-center justify-center">
                <span className="text-[9px] font-black text-red-600 tracking-tighter">QRIS</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC AMOUNT PILL */}
          <div className="mt-4 text-center space-y-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Nominal Tagihan (Dinamis)
            </div>
            <div className="text-2xl font-black text-red-600 tracking-tight tabular-nums">
              {formatRupiah(totalAmount)}
            </div>
            <p className="text-[10px] text-slate-400">
              Nominal otomatis terkunci, tanpa perlu input manual di aplikasi e-wallet.
            </p>
          </div>
        </div>

        {/* COUNTDOWN TIMER & STATUS BAR */}
        <div className="px-5 py-3 bg-amber-50 border-t border-b border-amber-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>Selesaikan Pembayaran:</span>
          </div>
          <div className="font-mono font-black text-amber-700 bg-amber-200/60 px-2.5 py-0.5 rounded-lg text-xs tracking-wider">
            {timeLeft > 0 ? timeFormatted : "KEDALUWARSA"}
          </div>
        </div>

        {/* SUPPORTED E-WALLETS & MOBILE BANKING STRIP */}
        <div className="px-6 py-4 bg-white text-center space-y-2 border-b border-slate-100">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Satu QR untuk Seluruh Aplikasi Pembayaran
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] font-extrabold text-slate-700">
            {["BCA Mobile", "Livin' Mandiri", "BRImo", "BNI Mobile", "GoPay", "OVO", "Dana", "ShopeePay", "LinkAja"].map(
              (app) => (
                <span
                  key={app}
                  className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200"
                >
                  {app}
                </span>
              )
            )}
          </div>
        </div>

        {/* VOUCHER FOOTER INSTRUCTIONS */}
        <div className="px-6 py-3.5 bg-slate-50 text-[10px] text-slate-500 text-center leading-relaxed">
          Dicetak oleh: <b>PT Solusi Edukasi Nusantara</b> • Izin Bank Indonesia & ASPI
        </div>
      </div>

      {/* ==========================================
          ACTION BUTTONS & TOOLBAR
          ========================================== */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          type="button"
          onClick={handleDownloadQr}
          className="btn-interactive inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Unduh Gambar QRIS</span>
        </button>

        {qrisString ? (
          <button
            type="button"
            onClick={handleCopyString}
            className="btn-interactive inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-800 dark:text-white font-bold hover:bg-slate-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "QRIS Tersalin!" : "Salin String QRIS"}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCopyInvoice}
            className="btn-interactive inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-surface-dark text-slate-800 dark:text-white font-bold hover:bg-slate-50"
          >
            {copiedInvoice ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedInvoice ? "Invoice Tersalin!" : "Salin No. Invoice"}</span>
          </button>
        )}
      </div>

      {/* CHECK STATUS BUTTON */}
      {onCheckStatus && (
        <button
          type="button"
          onClick={onCheckStatus}
          disabled={checkingStatus}
          className="btn-interactive w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 inline-flex items-center justify-center gap-2"
        >
          {checkingStatus ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>Cek Status Pembayaran (Real-Time)</span>
        </button>
      )}

      {/* SANDBOX / SIMULASI INFO NOTICE */}
      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs text-left space-y-1.5">
        <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
          <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Informasi Pemindaian Barcode (Sandbox vs Real QRIS):</span>
        </div>
        <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
          Jika Anda memindai barcode simulasi lokal ini menggunakan m-Banking dan muncul <i>&quot;Merchant tidak ditemukan&quot;</i>, itu adalah <b>perilaku normal perbankan</b> karena barcode lokal belum terdaftar di Bank Indonesia.
        </p>
        <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
          • <b>Untuk Uji Coba:</b> Gunakan tombol hijau <b>&quot;✓ Simulasikan Pembayaran Berhasil&quot;</b> di bawah untuk mengaktifkan paket secara instan.<br />
          • <b>Untuk Pembayaran Riil Siswa:</b> Pengelola dapat mengunggah barcode QRIS asli toko (BCA/GoPay/Shopee) di menu <b>Admin &gt; Pengaturan &gt; Gateway Pembayaran</b>.
        </p>
      </div>

      {/* QUICK STEP GUIDE */}
      <div className="p-4 rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-xs space-y-2 text-slate-600 dark:text-slate-300">
        <strong className="block text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Petunjuk Pembayaran QRIS:
        </strong>
        <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          <li>Buka aplikasi m-Banking (BCA, Mandiri, BRImo, BNI) atau E-Wallet (GoPay, Dana, OVO, ShopeePay).</li>
          <li>Pilih menu <b>Scan / Bayar QRIS</b> dan arahkan kamera ke barcode di atas (atau gunakan fitur upload dari galeri jika mengunduh gambar).</li>
          <li>Pastikan nama merchant tertera <b>{merchantName}</b> dengan nominal <b>{formatRupiah(totalAmount)}</b>.</li>
          <li>Masukkan PIN transaksi Anda untuk mengonfirmasi pembayaran. Akses paket akan aktif secara otomatis seketika!</li>
        </ol>
      </div>
    </div>
  );
}

