import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { scheduleId } = await req.json();
    if (!scheduleId) {
      return NextResponse.json({ error: "Schedule ID wajib disertakan." }, { status: 400 });
    }

    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Jadwal sesi kelas tidak ditemukan." }, { status: 404 });
    }

    // Upsert attendance
    const attendance = await prisma.classAttendance.upsert({
      where: {
        scheduleId_userId: {
          scheduleId,
          userId: user.id,
        },
      },
      update: {
        attendedAt: new Date(),
      },
      create: {
        scheduleId,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kehadiran kelas berhasil dicatat.",
      meetingUrl: schedule.meetingUrl,
      attendedAt: attendance.attendedAt,
    });
  } catch (err: any) {
    console.error("Attendance record error:", err);
    return NextResponse.json({ error: "Gagal mencatat presensi kelas." }, { status: 500 });
  }
}

