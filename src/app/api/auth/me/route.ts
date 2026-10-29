import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences,
        currentDeviceId: user.currentDeviceId,
        currentSessionId: user.currentSessionId,
      },
    });
  } catch (err: any) {
    console.error("Get user error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

