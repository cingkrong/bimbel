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

    // Terminate current device session and approve new device
    await prisma.$transaction([
      prisma.loginApprovalRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" },
      }),
      // Deactivate all existing sessions for this user so only the approved new one will remain active
      prisma.authSession.updateMany({
        where: { userId: user.id },
        data: { isActive: false },
      }),
    ]);

    const response = NextResponse.json({
      success: true,
      message: "Sesi dialihkan ke perangkat baru. Perangkat ini telah keluar.",
    });

    response.cookies.delete("auth_session");
    return response;
  } catch (err: any) {
    console.error("Approve login error:", err);
    return NextResponse.json({ error: "Gagal menyetujui login." }, { status: 500 });
  }
}

