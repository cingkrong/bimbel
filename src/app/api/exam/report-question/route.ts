import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId, reportType, notes } = await req.json();
    if (!questionId || !reportType) {
      return NextResponse.json({ error: "Parameter laporan tidak lengkap." }, { status: 400 });
    }

    const report = await prisma.questionReport.create({
      data: {
        userId: user.id,
        questionId,
        reportType,
        notes: notes || "",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Laporan soal berhasil dikirim dan akan ditinjau oleh tim tutor.",
      reportId: report.id,
    });
  } catch (err: any) {
    console.error("Report question error:", err);
    return NextResponse.json({ error: "Gagal mengirim laporan soal." }, { status: 500 });
  }
}

