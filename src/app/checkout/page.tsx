"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  Tag,
  CheckCircle,
  Copy,
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { QrisVoucher } from "@/components/payment/QrisVoucher";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [paymentChannel, setPaymentChannel] = useState("qris");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [appSettings, setAppSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings/public")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) setAppSettings(data.settings);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          const p = data.products.find((item: any) => item.id === productId) || data.products[0];
          setProduct(p);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !product) return;
    setValidatingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch("/api/payment/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          amount: Number(product.price),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.message || "Kupon tidak valid.");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
      }
    } catch {
      setCouponError("Gagal memvalidasi kupon.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    if (!product) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          paymentChannel,
          couponCode: appliedCoupon?.code,
          referralCode: "FAJARSTAN2026",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTransaction(data.transaction);
      } else {
        if (res.status === 401) {
          router.push(`/login?redirect=/checkout?productId=${product.id}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePaymentWebhook = async () => {
    if (!transaction) return;
    setIsSimulatingPayment(true);

    try {
      const res = await fetch("/api/payment/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber: transaction.invoiceNumber,
          status: "PAID",
          transaction_status: "settlement",
        }),
      });

      if (res.ok) {
        setPaymentSuccess(true);
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch { }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  const [checkingStatus, setCheckingStatus] = useState(false);

  const handleCheckPaymentStatus = async () => {
    if (!transaction) return;
    setCheckingStatus(true);
    try {
      const res = await fetch(`/api/payment/status?invoiceNumber=${transaction.invoiceNumber}`);
      if (res.ok) {
        const data = await res.json();
        if (data.isPaid) {
          setPaymentSuccess(true);
          try {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
            });
          } catch { }
        } else {
          alert("Pembayaran belum terdeteksi. Silakan selesaikan scan/transfer QRIS terlebih dahulu.");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-sm text-slate-500">Produk tidak ditemukan.</p>
      </div>
    );
  }

  const originalPrice = Number(product.price);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const adminFee = 1500;
  const finalTotal = Math.max(0, originalPrice - discount) + adminFee;

  return (
    <>
      <div className="border-b border-slate-200 dark:border-white/10 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Checkout & Pembayaran Paket
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Akses instan langsung terbuka otomatis setelah pembayaran terkonfirmasi.
        </p>
      </div>

      {!transaction ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Payment Method & Coupon (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Payment Method Selector */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 space-y-4 shadow-sm">
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-600" />
                Pilih Metode Pembayaran
              </h2>

              <div className="space-y-3">
                <label
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${paymentChannel === "qris"
                    ? "border-rose-600 bg-rose-50/50 dark:bg-rose-950/20"
                    : "border-slate-200 dark:border-white/10"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentChannel"
                      value="qris"
                      checked={paymentChannel === "qris"}
                      onChange={(e) => setPaymentChannel(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-rose-600" />
                        QRIS Dinamis (Semua E-Wallet & Mobile Banking)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, Dana
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Instan
                  </span>
                </label>

                <label
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${paymentChannel === "bca_va"
                    ? "border-rose-600 bg-rose-50/50 dark:bg-rose-950/20"
                    : "border-slate-200 dark:border-white/10"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentChannel"
                      value="bca_va"
                      checked={paymentChannel === "bca_va"}
                      onChange={(e) => setPaymentChannel(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        BCA Virtual Account
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Verifikasi otomatis 24 jam tanpa perlu bukti transfer
                      </div>
                    </div>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${paymentChannel === "mandiri_va"
                    ? "border-rose-600 bg-rose-50/50 dark:bg-rose-950/20"
                    : "border-slate-200 dark:border-white/10"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentChannel"
                      value="mandiri_va"
                      checked={paymentChannel === "mandiri_va"}
                      onChange={(e) => setPaymentChannel(e.target.value)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Mandiri Virtual Account (Livin')
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Transfer via ATM atau Livin' by Mandiri
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 space-y-4 shadow-sm">
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-600" />
                Voucher & Kupon Diskon
              </h2>

              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Contoh: LOLOS2026"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-canvas-dark text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon}
                  className="btn-interactive px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
                >
                  {validatingCoupon ? "Mengecek..." : "Gunakan Kupon"}
                </button>
              </form>

              {appliedCoupon && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>
                    Kupon <b>{appliedCoupon.code}</b> berhasil digunakan! Potongan {formatRupiah(appliedCoupon.discountAmount)}
                  </span>
                </div>
              )}

              {couponError && (
                <div className="text-xs text-rose-600 font-semibold">{couponError}</div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 space-y-5 shadow-sm">
            <h2 className="font-extrabold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-white/5">
              Ringkasan Pesanan
            </h2>

            <div className="space-y-1">
              <div className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                {product.name}
              </div>
              <div className="text-xs text-slate-500">
                Kategori: {product.category.toUpperCase()} • Periode 2026
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Harga Normal Paket:</span>
                <span className="font-mono">{formatRupiah(originalPrice)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Diskon Kupon Promo:</span>
                  <span className="font-mono">- {formatRupiah(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Biaya Layanan Gerbang Pembayaran:</span>
                <span className="font-mono">{formatRupiah(adminFee)}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-3 border-t border-slate-200 dark:border-white/10">
                <span>Total Tagihan:</span>
                <span className="text-rose-600 tabular-nums">{formatRupiah(finalTotal)}</span>
              </div>
            </div>

            {appSettings.active_payment_gateway === "MANUAL_WHATSAPP" ? (
              <a
                href={`https://wa.me/${(appSettings.whatsapp_hotline || "081234567890").replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Halo Admin LolosKampus, saya ingin memesan paket ${product.name} seharga ${formatRupiah(finalTotal)}. Mohon petunjuk rekening transfer.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="btn-interactive w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <span>Beli via WhatsApp CS Resmi</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="btn-interactive w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2"
              >
                {isProcessing ? "Menyiapkan Pembayaran..." : "Bayar Sekarang"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Transaksi terenkripsi aman SSL 256-bit
            </div>
          </div>
        </div>
      ) : (
        /* Payment Instruction View */
        <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 sm:p-8 shadow-xl text-center space-y-6">
          {!paymentSuccess ? (
            <>
              {transaction.paymentChannel === "qris" || transaction.qrCodeUrl ? (
                <QrisVoucher
                  invoiceNumber={transaction.invoiceNumber}
                  totalAmount={transaction.totalAmount}
                  qrCodeUrl={transaction.qrCodeUrl}
                  qrisString={transaction.qrisMeta?.qrisString}
                  merchantName={transaction.qrisMeta?.merchantName || appSettings.qris_merchant_name}
                  nmid={transaction.qrisMeta?.nmid || appSettings.qris_nmid}
                  merchantCity={transaction.qrisMeta?.merchantCity || appSettings.qris_merchant_city}
                  expiresAt={transaction.expiresAt}
                  onCheckStatus={handleCheckPaymentStatus}
                  checkingStatus={checkingStatus}
                />
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                      MENUNGGU PEMBAYARAN VIRTUAL ACCOUNT
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Invoice #{transaction.invoiceNumber}
                    </h2>
                    <div className="text-2xl font-black text-rose-600 tabular-nums">
                      {formatRupiah(transaction.totalAmount)}
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2">
                    <div className="text-xs text-slate-500 font-semibold">Nomor Virtual Account:</div>
                    <div className="text-2xl font-mono font-black text-slate-900 dark:text-white tracking-widest">
                      {transaction.vaNumber}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Batas waktu pembayaran 24 jam. Verifikasi otomatis tanpa perlu konfirmasi manual.
                    </p>
                  </div>
                </div>
              )}

              {/* Developer Webhook Simulator */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-xs space-y-2 border border-slate-200 dark:border-white/5">
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  <b>Simulasi Sandbox Pembayaran:</b> Tekan tombol di bawah untuk memicu konfirmasi otomatis seolah-olah Anda telah membayar via m-Banking/QRIS.
                </p>
                <button
                  onClick={handleSimulatePaymentWebhook}
                  disabled={isSimulatingPayment}
                  className="btn-interactive w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isSimulatingPayment ? "Memproses Webhook..." : "✓ Simulasikan Pembayaran Berhasil"}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Pembayaran Berhasil Dikonfirmasi!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Terima kasih! Paket <b>{transaction.productName}</b> Anda telah aktif dan dapat langsung digunakan untuk simulasi CAT dan kelas bimbel.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => router.push("/tryout")}
                  className="btn-interactive px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Mulai Simulasi Tryout Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function CheckoutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto" />}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
