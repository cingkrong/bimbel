import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, recordAuditLog } from "@/lib/admin-auth";

const MOCK_BIMBEL_CLASSES = [
  {
    id: "cls-01",
    title: "Program Intensif Kedinasan PKN STAN & STIS 2026",
    description: "Pendampingan live meeting 3x seminggu bersama tutor master alumni STAN & BKN.",
    tutorName: "Kak Dimas Setiawan, S.Tr.Ak (Alumni STAN)",
    tutorAvatar: null,
    schedules: [
      {
        id: "sch-01",
        topic: "Bedah Trik Cepat Silogisme TIU & Logika Deret BKN",
        startTime: "2026-10-30T19:30:00Z",
        endTime: "2026-10-30T21:30:00Z",
        meetingUrl: "https://zoom.us/j/9876543210?pwd=STAN",
        attendancesCount: 42,
      },
      {
        id: "sch-02",
        topic: "Strategi Menaklukkan Nilai Maksimal TKP Anti-Radikalisme",
        startTime: "2026-11-02T19:30:00Z",
        endTime: "2026-11-02T21:30:00Z",
        meetingUrl: "https://zoom.us/j/9876543211?pwd=STAN",
        attendancesCount: 38,
      },
    ],
    assignments: [
      {
        id: "asg-01",
        title: "Tugas Mandiri 50 Soal Analogi Kata & Numerik Cepat",
        instruction: "Kerjakan seluruh soal dalam lembar kerja terlampir dan upload file scan PDF.",
        deadline: "2026-11-01T23:59:00Z",
        submissionsCount: 35,
      },
    ],
    recordings: [
      {
        id: "rec-01",
        title: "Rekaman Pertemuan #1: Fondasi Logika Matematika TIU",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        durationText: "1 Jam 52 Menit",
        sortOrder: 1,
      },
      {
        id: "rec-02",
        title: "Rekaman Pertemuan #2: Trik Sila Pancasila & Sejarah TWK",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        durationText: "2 Jam 05 Menit",
        sortOrder: 2,
      },
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let classes: any[] = [];
    try {
      const dbClasses = await prisma.bimbelClass.findMany({
        include: {
          schedules: {
            include: {
              _count: { select: { attendances: true } },
            },
            orderBy: { startTime: "asc" },
          },
          assignments: {
            include: {
              _count: { select: { submissions: true } },
            },
            orderBy: { deadline: "asc" },
          },
          recordings: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      if (dbClasses.length > 0) {
        classes = dbClasses.map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          tutorName: c.tutorName,
          tutorAvatar: c.tutorAvatar,
          schedules: c.schedules.map((s) => ({
            id: s.id,
            topic: s.topic,
            startTime: s.startTime,
            endTime: s.endTime,
            meetingUrl: s.meetingUrl,
            attendancesCount: s._count.attendances,
          })),
          assignments: c.assignments.map((a) => ({
            id: a.id,
            title: a.title,
            instruction: a.instruction,
            deadline: a.deadline,
            submissionsCount: a._count.submissions,
          })),
          recordings: c.recordings,
        }));
      }
    } catch (err) {
      console.warn("DB bimbel classes fetch error, falling back:", err);
    }

    if (classes.length === 0) {
      classes = MOCK_BIMBEL_CLASSES;
    }

    return NextResponse.json({ classes });
  } catch (error: any) {
    console.error("GET /api/admin/bimbel error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, classId, payload } = body;

    if (action === "ADD_SCHEDULE") {
      const { topic, startTime, endTime, meetingUrl } = payload;
      const created = await prisma.classSchedule.create({
        data: {
          classId,
          topic,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          meetingUrl: meetingUrl || null,
        },
      });
      await recordAuditLog(admin.id, "ADD_CLASS_SCHEDULE", "ClassSchedule", created.id, { topic });
      return NextResponse.json({ schedule: created }, { status: 201 });
    }

    if (action === "ADD_RECORDING") {
      const { title, videoUrl, durationText, sortOrder } = payload;
      const created = await prisma.classRecording.create({
        data: {
          classId,
          title,
          videoUrl,
          durationText: durationText || "1 Jam 30 Menit",
          sortOrder: Number(sortOrder) || 1,
        },
      });
      await recordAuditLog(admin.id, "ADD_CLASS_RECORDING", "ClassRecording", created.id, { title });
      return NextResponse.json({ recording: created }, { status: 201 });
    }

    if (action === "ADD_ASSIGNMENT") {
      const { title, instruction, deadline } = payload;
      const created = await prisma.classAssignment.create({
        data: {
          classId,
          title,
          instruction: instruction || "",
          deadline: new Date(deadline),
        },
      });
      await recordAuditLog(admin.id, "ADD_CLASS_ASSIGNMENT", "ClassAssignment", created.id, { title });
      return NextResponse.json({ assignment: created }, { status: 201 });
    }

    return NextResponse.json({ error: "Action tidak dikenali" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/admin/bimbel error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

