import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, recordAuditLog } from "@/lib/admin-auth";

const MOCK_COUPONS = [
  {
    id: "cpn-01",
    code: "LOLOSSTAN2026",
    discountType: "PERCENT",
    discountValue: 20,
    maxUsage: 500,
    usageCount: 142,
    validUntil: "2026-12-31T23:59:59Z",
    isActive: true,
  },
  {
    id: "cpn-02",
    code: "PEJUANGCPNS",
    discountType: "FIXED",
    discountValue: 25000,
    maxUsage: 200,
    usageCount: 88,
    validUntil: "2026-11-30T23:59:59Z",
    isActive: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let coupons: any[] = [];
    try {
      const dbCoupons = await prisma.coupon.findMany({
        orderBy: { code: "asc" },
      });
      if (dbCoupons.length > 0) {
        coupons = dbCoupons.map((c) => ({
          ...c,
          discountValue: Number(c.discountValue),
        }));
      }
    } catch (err) {
      console.warn("DB coupon fetch error, using mock:", err);
    }

    if (coupons.length === 0) {
      coupons = MOCK_COUPONS;
    }

    return NextResponse.json({ coupons });
  } catch (error: any) {
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
    const { code, discountType, discountValue, maxUsage, validUntil } = body;

    const created = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        discountType: discountType || "PERCENT",
        discountValue: Number(discountValue) || 10,
        maxUsage: Number(maxUsage) || 100,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    await recordAuditLog(admin.id, "CREATE_COUPON", "Coupon", created.id, { code });

    return NextResponse.json({ coupon: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

