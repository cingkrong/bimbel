import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json({ error: "Request ID wajib disertakan." }, { status: 400 });
    }

    const approval = await prisma.loginApprovalRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });

    if (!approval) {
      return NextResponse.json({ error: "Permintaan persetujuan tidak ditemukan." }, { status: 404 });
    }

    // Check if expired
    if (approval.status === "PENDING" && new Date() > approval.expiresAt) {
      await prisma.loginApprovalRequest.update({
        where: { id: requestId },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json({ status: "EXPIRED" });
    }

    if (approval.status === "APPROVED") {
      // Create session for the approved new device
      const session = await prisma.authSession.create({
        data: {
          userId: approval.userId,
          deviceId: approval.newDeviceId,
          deviceInfo: approval.newDeviceInfo,
          ipAddress: approval.ipAddress,
          isActive: true,
        },
      });

      const token = await createSessionToken({
        userId: approval.user.id,
        email: approval.user.email,
        role: approval.user.role,
        deviceId: approval.newDeviceId,
        sessionId: session.id,
      });

      const response = NextResponse.json({
        status: "APPROVED",
        user: {
          id: approval.user.id,
          username: approval.user.username,
          email: approval.user.email,
          role: approval.user.role,
          profile: approval.user.profile,
        },
      });

      response.cookies.set("auth_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ status: approval.status });
  } catch (err: any) {
    console.error("Login status check error:", err);
    return NextResponse.json({ error: "Gagal memeriksa status login." }, { status: 500 });
  }
}

