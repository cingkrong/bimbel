import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, deviceId, deviceInfo } = body;

    if (!email || !password || !deviceId) {
      return NextResponse.json(
        { error: "Email, password, dan identifikasi perangkat wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        preferences: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Email atau kata sandi tidak valid." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Email atau kata sandi tidak valid." },
        { status: 401 }
      );
    }

    // 1. Fetch system security setting for login device approval
    let isDeviceApprovalEnabled = true;
    try {
      const approvalSetting = await prisma.appSetting.findUnique({
        where: { key: "enable_device_approval" },
      });
      if (approvalSetting) {
        isDeviceApprovalEnabled = approvalSetting.value === "true";
      }
    } catch (e) {
      console.warn("Failed to query enable_device_approval setting, defaulting to true:", e);
    }

    // Check for an existing active session on a DIFFERENT device
    const existingOtherSession = await prisma.authSession.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        deviceId: { not: deviceId },
      },
      orderBy: { lastActiveAt: "desc" },
    });

    if (existingOtherSession && isDeviceApprovalEnabled) {
      // Device approval is ON: Create a LoginApprovalRequest for Device B
      const approvalRequest = await prisma.loginApprovalRequest.create({
        data: {
          userId: user.id,
          newDeviceId: deviceId,
          newDeviceInfo: deviceInfo || "Perangkat Web Baru",
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
          status: "PENDING",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        },
      });

      return NextResponse.json({
        status: "REQUIRES_APPROVAL",
        requestId: approvalRequest.id,
        message: "Akun Anda sedang aktif di perangkat lain. Menunggu persetujuan dari perangkat utama.",
      });
    }

    // If device approval is OFF, or there is an existing session, deactivate old sessions
    // to strictly enforce single active session (auto-override / auto-kick)
    await prisma.authSession.updateMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // Create a fresh active session for this device
    const newSession = await prisma.authSession.create({
      data: {
        userId: user.id,
        deviceId,
        deviceInfo: deviceInfo || "Browser Web",
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        isActive: true,
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      deviceId,
      sessionId: newSession.id,
    });

    const response = NextResponse.json({
      status: "SUCCESS",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
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
  } catch (err: any) {
    console.error("Login Error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server internal saat login." },
      { status: 500 }
    );
  }
}

