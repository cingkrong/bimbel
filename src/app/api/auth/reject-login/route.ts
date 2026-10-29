import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId } = await req.json();
    if (!requestId) {
      return NextResponse.json({ error: "Request ID wajib disertakan." }, { status: 400 });
    }

    await prisma.loginApprovalRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });

    return NextResponse.json({ success: true, message: "Permintaan login ditolak." });
  } catch (err: any) {
    console.error("Reject login error:", err);
    return NextResponse.json({ error: "Gagal menolak login." }, { status: 500 });
  }
}

