import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDynamicQris } from "@/lib/qris";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu untuk checkout." }, { status: 401 });
    }

    const { productId, paymentChannel, couponCode, referralCode } = await req.json();

    if (!productId || !paymentChannel) {
      return NextResponse.json({ error: "Produk dan metode pembayaran wajib dipilih." }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Produk tidak tersedia." }, { status: 404 });
    }

    let totalAmount = Number(product.price);
    let discountAmount = 0;

    // Apply Coupon if any
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (coupon && coupon.isActive) {
        if (coupon.discountType === "FIXED") {
          discountAmount = Number(coupon.discountValue);
        } else if (coupon.discountType === "PERCENT") {
          discountAmount = (totalAmount * Number(coupon.discountValue)) / 100;
          if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
            discountAmount = Number(coupon.maxDiscount);
          }
        }
        discountAmount = Math.min(discountAmount, totalAmount);
        totalAmount -= discountAmount;
      }
    }

    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Query payment gateway settings
    const settingsList = await prisma.appSetting.findMany({
      where: { category: "payment" },
    });
    const settingsMap: Record<string, string> = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    let vaNumber: string | null = null;
    let qrCodeUrl: string | null = null;
    let qrisMeta: any = null;

    if (paymentChannel.includes("va")) {
      const bankCode = paymentChannel.split("_")[0].toUpperCase();
      vaNumber = `8809${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    } else if (paymentChannel === "qris") {
      const payableAmount = totalAmount + 1500; // Total includes payment processing fee
      const activeGateway = settingsMap.active_payment_gateway || "BIONPAY_QRIS_ONLY";
      const bionApiKey = settingsMap.bionpay_api_key;
      const bionBaseUrl = settingsMap.bionpay_base_url || "https://orbit.bion.id";

      // Build 100% compliant EMVCo MPM QRIS
      const qrisObj = generateDynamicQris({
        amount: payableAmount,
        invoiceNumber,
        merchantName: settingsMap.qris_merchant_name || "LOLOSKAMPUS BIMBEL CAT",
        nmid: settingsMap.qris_nmid || "ID1024319802914",
        city: settingsMap.qris_merchant_city || "JAKARTA",
        baseQrisString: settingsMap.qris_static_string || undefined,
        customImageUrl: settingsMap.qris_static_image_url || undefined,
      });

      // Handshake with BionPay if live key provided
      if (activeGateway === "BIONPAY_QRIS_ONLY" && bionApiKey && !bionApiKey.includes("••••") && !bionApiKey.startsWith("bp_live_89")) {
        try {
          const origin = req.headers.get("origin") || "http://localhost:3000";
          const bionRes = await fetch(`${bionBaseUrl}/api/v1/transaction/create`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${bionApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              invoice_number: invoiceNumber,
              amount: payableAmount,
              provider: settingsMap.bionpay_provider || "AUTO",
              customer_name: user.profile?.fullName || user.username,
              customer_email: user.email,
              callback_url: `${origin}/api/payment/webhook`,
              return_url: `${origin}/payment/finish`,
            }),
            signal: AbortSignal.timeout(2500),
          });
          if (bionRes.ok) {
            const bionData = await bionRes.json();
            if (bionData.qr_string || bionData.qris_string) {
              qrisObj.qrisString = bionData.qr_string || bionData.qris_string;
              qrisObj.qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=15&ecc=M&data=${encodeURIComponent(qrisObj.qrisString)}`;
            }
            if (bionData.qr_image_url) {
              qrisObj.qrImageUrl = bionData.qr_image_url;
            }
          }
        } catch (e) {
          console.warn("BionPay API call skipped, standard EMVCo QRIS generator active:", e);
        }
      }

      qrCodeUrl = qrisObj.qrImageUrl;
      qrisMeta = qrisObj;
    }

    const transaction = await prisma.transaction.create({
      data: {
        invoiceNumber,
        userId: user.id,
        totalAmount,
        discountAmount,
        paymentMethod: paymentChannel.includes("va") ? "VIRTUAL_ACCOUNT" : "QRIS",
        paymentChannel,
        paymentFee: 1500,
        status: "PENDING",
        vaNumber,
        qrCodeUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        items: {
          create: [
            {
              productId: product.id,
              price: product.price,
            },
          ],
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Check referral code
    if (referralCode) {
      const ref = await prisma.referralCode.findUnique({
        where: { code: referralCode.toUpperCase() },
      });
      if (ref && ref.userId !== user.id) {
        const commission = (totalAmount * Number(ref.commissionPct)) / 100;
        await prisma.referralUsage.create({
          data: {
            referralCodeId: ref.id,
            userId: ref.userId,
            buyerId: user.id,
            transactionId: transaction.id,
            commissionEarned: commission,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        invoiceNumber: transaction.invoiceNumber,
        totalAmount: Number(transaction.totalAmount),
        discountAmount: Number(transaction.discountAmount),
        paymentChannel: transaction.paymentChannel,
        status: transaction.status,
        vaNumber: transaction.vaNumber,
        qrCodeUrl: transaction.qrCodeUrl,
        expiresAt: transaction.expiresAt,
        productName: product.name,
        qrisMeta,
      },
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Gagal membuat transaksi." }, { status: 500 });
  }
}

