import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classes = await prisma.bimbelClass.findMany({
      include: {
        schedules: {
          orderBy: { startTime: "asc" },
          include: {
            attendances: {
              where: { userId: user.id },
            },
          },
        },
        recordings: {
          orderBy: { sortOrder: "asc" },
        },
        assignments: {
          orderBy: { deadline: "asc" },
          include: {
            submissions: {
              where: { userId: user.id },
            },
          },
        },
      },
    });

    return NextResponse.json({ classes });
  } catch (err: any) {
    console.error("Bimbel classes error:", err);
    return NextResponse.json({ error: "Gagal memuat jadwal kelas bimbel." }, { status: 500 });
  }
}

