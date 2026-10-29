import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createAdminToken, recordAuditLog } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan kata sandi admin wajib diisi." },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: "Kredensial admin tidak valid atau akun dinonaktifkan." },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Kredensial admin tidak valid." },
        { status: 401 }
      );
    }

    const token = await createAdminToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    // Record Audit Log
    await recordAuditLog({
      adminId: admin.id,
      action: "ADMIN_LOGIN",
      targetEntity: "AdminUser",
      targetId: admin.id,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        avatarUrl: admin.avatarUrl,
      },
    });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Admin Login Error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat login admin." },
      { status: 500 }
    );
  }
}

