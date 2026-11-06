import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMetaCapiEvent } from "@/lib/meta-ads";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceNumber, status, order_id, transaction_status } = body;

    const targetInvoice = invoiceNumber || order_id;

    if (!targetInvoice) {
      return NextResponse.json({ error: "Invoice number tidak valid." }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { invoiceNumber: targetInvoice },
      include: {
        referralUsage: true,
        user: {
          select: {
            email: true,
            profile: {
              select: {
                phone: true,
                fullName: true,
              },
            },
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    // Determine target status
    const isPaid =
      status === "PAID" ||
      transaction_status === "settlement" ||
      transaction_status === "capture";

    if (isPaid) {
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });

        // If referral was used, increment referrer's earned commission
        if (transaction.referralUsage) {
          await tx.referralCode.update({
            where: { id: transaction.referralUsage.referralCodeId },
            data: {
              totalEarned: {
                increment: transaction.referralUsage.commissionEarned,
              },
            },
          });
        }
      });

      // =========================================================================
      // Meta Conversions API (CAPI) Server-Side Purchase Event
      // =========================================================================
      try {
        const metaSettings = await prisma.appSetting.findMany({
          where: {
            key: {
              in: [
                "meta_ads_active",
                "meta_pixel_id",
                "meta_capi_token",
                "meta_test_event_code",
                "meta_track_purchase",
              ],
            },
          },
        });

        const metaMap: Record<string, string> = {};
        metaSettings.forEach((s) => {
          metaMap[s.key] = s.value;
        });

        if (metaMap.meta_ads_active === "true" && metaMap.meta_track_purchase !== "false") {
          const pixelId = metaMap.meta_pixel_id;
          const accessToken = metaMap.meta_capi_token;

          if (pixelId && accessToken) {
            const firstItem = transaction.items[0]?.product;
            const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
            const userAgent = req.headers.get("user-agent") || undefined;

            await sendMetaCapiEvent({
              pixelId,
              accessToken,
              testEventCode: metaMap.meta_test_event_code || undefined,
              eventName: "Purchase",
              eventId: transaction.invoiceNumber, // Deduplication key with client pixel
              eventSourceUrl: "https://loloskampus.com/checkout",
              userData: {
                email: transaction.user.email,
                phone: transaction.user.profile?.phone || undefined,
                firstName: transaction.user.profile?.fullName?.split(" ")[0] || undefined,
                lastName: transaction.user.profile?.fullName?.split(" ").slice(1).join(" ") || undefined,
                clientIp,
                clientUserAgent: userAgent,
              },
              customData: {
                value: Number(transaction.totalAmount),
                currency: "IDR",
                content_name: firstItem?.name || "Paket Bimbel CAT LolosKampus",
                content_type: "product",
                content_ids: transaction.items.map((i) => i.productId),
                order_id: transaction.invoiceNumber,
              },
            });
          }
        }
      } catch (metaErr) {
        console.error("Meta CAPI server-side event tracking failed:", metaErr);
      }

      return NextResponse.json({ success: true, message: "Transaksi berhasil diverifikasi sebagai LUNAS." });
    }

    return NextResponse.json({ success: true, message: "Status transaksi diproses." });
  } catch (err: any) {
    console.error("Payment webhook error:", err);
    return NextResponse.json({ error: "Webhook processing error." }, { status: 500 });
  }
}
