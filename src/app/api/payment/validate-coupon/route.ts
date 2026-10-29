import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, amount } = await req.json();

    if (!code || amount === undefined) {
      return NextResponse.json({ error: "Kode kupon dan nominal wajib diisi." }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, message: "Kupon tidak ditemukan atau tidak aktif." }, { status: 404 });
    }

    if (coupon.validUntil && new Date() > coupon.validUntil) {
      return NextResponse.json({ valid: false, message: "Masa berlaku kupon telah berakhir." }, { status: 400 });
    }

    if (coupon.minSpend && amount < Number(coupon.minSpend)) {
      return NextResponse.json({
        valid: false,
        message: `Minimal belanja untuk menggunakan kupon ini adalah Rp ${Number(coupon.minSpend).toLocaleString("id-ID")}`,
      }, { status: 400 });
    }

    let discount = 0;
    if (coupon.discountType === "FIXED") {
      discount = Number(coupon.discountValue);
    } else if (coupon.discountType === "PERCENT") {
      discount = (amount * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    }

    discount = Math.min(discount, amount);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountAmount: discount,
      finalAmount: amount - discount,
    });
  } catch (err: any) {
    console.error("Validate coupon error:", err);
    return NextResponse.json({ error: "Gagal memvalidasi kupon." }, { status: 500 });
  }
}

