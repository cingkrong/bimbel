import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user && user.currentSessionId) {
      await prisma.authSession.update({
        where: { id: user.currentSessionId },
        data: { isActive: false },
      });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("auth_session");
    return response;
  } catch (err: any) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Gagal logout." }, { status: 500 });
  }
}

