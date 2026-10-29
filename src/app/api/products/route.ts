import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        benefits: {
          orderBy: { sortOrder: "asc" },
        },
        tryoutPackages: {
          select: { id: true, title: true, totalQuestions: true, durationMinutes: true },
        },
        classes: {
          select: { id: true, title: true, tutorName: true },
        },
      },
      orderBy: { price: "asc" },
    });

    return NextResponse.json({ products });
  } catch (err: any) {
    console.error("Products fetch error:", err);
    return NextResponse.json({ error: "Gagal memuat katalog paket." }, { status: 500 });
  }
}

