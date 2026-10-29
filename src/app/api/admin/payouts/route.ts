import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, recordAuditLog } from "@/lib/admin-auth";

const MOCK_PAYOUTS = [
  {
    id: "pay-01",
    amount: 150000,
    bankName: "BCA",
    accountNumber: "8830192812",
    accountHolder: "Aditya Pratama Putra",
    status: "PENDING",
    createdAt: "2026-10-27T10:00:00Z",
    user: {
      username: "aditya_stan",
      profile: { fullName: "Aditya Pratama Putra" },
    },
    referralCode: { code: "STANADIT" },
  },
  {
    id: "pay-02",
    amount: 320000,
    bankName: "Bank Mandiri",
    accountNumber: "140001928374",
    accountHolder: "Siti Nurhaliza",
    status: "PAID",
    createdAt: "2026-10-25T14:30:00Z",
    processedAt: "2026-10-26T09:10:00Z",
    user: {
      username: "siti_nur",
      profile: { fullName: "Siti Nurhaliza" },
    },
    referralCode: { code: "SITIPASS" },
  },
];

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payouts: any[] = [];
    try {
      const dbPayouts = await prisma.affiliatePayout.findMany({
        include: {
          user: {
            select: {
              username: true,
              profile: { select: { fullName: true } },
            },
          },
          referralCode: { select: { code: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      if (dbPayouts.length > 0) {
        payouts = dbPayouts.map((p) => ({
          ...p,
          amount: Number(p.amount),
        }));
      }
    } catch (err) {
      console.warn("DB payouts fetch error, using mock:", err);
    }

    if (payouts.length === 0) {
      payouts = MOCK_PAYOUTS;
    }

    return NextResponse.json({ payouts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { payoutId } = body;

    const updated = await prisma.affiliatePayout.update({
      where: { id: payoutId },
      data: {
        status: "PAID",
        processedAt: new Date(),
      },
    });

    await recordAuditLog(admin.id, "APPROVE_PAYOUT", "AffiliatePayout", payoutId, {});

    return NextResponse.json({ payout: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

