import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceNumber = searchParams.get("invoiceNumber");

    if (!invoiceNumber) {
      return NextResponse.json({ error: "Invoice number is required." }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { invoiceNumber },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        paidAt: true,
        totalAmount: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: transaction.status,
      paidAt: transaction.paidAt,
      isPaid: transaction.status === "PAID",
    });
  } catch (err: any) {
    console.error("Payment status check error:", err);
    return NextResponse.json({ error: "Gagal memeriksa status pembayaran." }, { status: 500 });
  }
}

