import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, recordAuditLog } from "@/lib/admin-auth";

const MOCK_TRANSACTIONS = [
  {
    id: "tx-001",
    invoiceNumber: "INV-20261028-001",
    totalAmount: 99000,
    paymentChannel: "QRIS Dinamis",
    status: "PAID",
    createdAt: "2026-10-28T08:30:00Z",
    paidAt: "2026-10-28T08:32:15Z",
    user: {
      username: "aditya_stan",
      email: "aditya.pratama@gmail.com",
      profile: { fullName: "Aditya Pratama Putra", phone: "081234567890" },
    },
    items: [
      { product: { name: "Paket Intensif Tryout SKD BKN 2026" }, price: 99000 },
    ],
  },
  {
    id: "tx-002",
    invoiceNumber: "INV-20261028-002",
    totalAmount: 249000,
    paymentChannel: "BCA Virtual Account",
    status: "PAID",
    createdAt: "2026-10-28T10:14:00Z",
    paidAt: "2026-10-28T10:16:00Z",
    user: {
      username: "siti_nur",
      email: "siti.nurhaliza@gmail.com",
      profile: { fullName: "Siti Nurhaliza", phone: "081398765432" },
    },
    items: [
      { product: { name: "Bundling Bimbel Live Zoom + 10x Tryout CAT" }, price: 249000 },
    ],
  },
  {
    id: "tx-003",
    invoiceNumber: "INV-20261028-003",
    totalAmount: 99000,
    paymentChannel: "Mandiri Virtual Account",
    status: "PENDING",
    createdAt: "2026-10-28T14:45:00Z",
    paidAt: null,
    user: {
      username: "rian_ipdn",
      email: "rian.hidayat@gmail.com",
      profile: { fullName: "Rian Hidayatullah", phone: "082155443322" },
    },
    items: [
      { product: { name: "Paket Intensif Tryout SKD BKN 2026" }, price: 99000 },
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let transactions: any[] = [];
    try {
      const where: any = {};
      if (status && status !== "ALL") {
        where.status = status;
      }

      const dbTxs = await prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              username: true,
              email: true,
              profile: { select: { fullName: true, phone: true } },
            },
          },
          items: {
            include: { product: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      if (dbTxs.length > 0) {
        transactions = dbTxs.map((t) => ({
          id: t.id,
          invoiceNumber: t.invoiceNumber,
          totalAmount: Number(t.totalAmount),
          paymentChannel: t.paymentChannel || "QRIS",
          status: t.status,
          createdAt: t.createdAt,
          paidAt: t.paidAt,
          user: t.user,
          items: t.items.map((i) => ({
            product: i.product,
            price: Number(i.price),
          })),
        }));
      }
    } catch (err) {
      console.warn("DB transactions fetch error, falling back:", err);
    }

    if (transactions.length === 0) {
      transactions = MOCK_TRANSACTIONS;
      if (status && status !== "ALL") {
        transactions = transactions.filter((t) => t.status === status);
      }
    }

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error("GET /api/admin/transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    await recordAuditLog(
      admin.id,
      "MANUAL_VERIFY_TRANSACTION",
      "Transaction",
      transactionId,
      { invoiceNumber: updated.invoiceNumber }
    );

    return NextResponse.json({ transaction: updated });
  } catch (error: any) {
    console.error("POST /api/admin/transactions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

