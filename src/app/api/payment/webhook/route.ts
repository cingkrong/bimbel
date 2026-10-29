import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

      return NextResponse.json({ success: true, message: "Transaksi berhasil diverifikasi sebagai LUNAS." });
    }

    return NextResponse.json({ success: true, message: "Status transaksi diproses." });
  } catch (err: any) {
    console.error("Payment webhook error:", err);
    return NextResponse.json({ error: "Webhook processing error." }, { status: 500 });
  }
}

