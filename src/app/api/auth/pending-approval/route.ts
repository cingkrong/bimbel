import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingRequest = await prisma.loginApprovalRequest.findFirst({
      where: {
        userId: user.id,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!pendingRequest) {
      return NextResponse.json({ hasPending: false });
    }

    return NextResponse.json({
      hasPending: true,
      request: {
        id: pendingRequest.id,
        newDeviceInfo: pendingRequest.newDeviceInfo,
        ipAddress: pendingRequest.ipAddress,
        createdAt: pendingRequest.createdAt,
      },
    });
  } catch (err: any) {
    console.error("Pending approval check error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

