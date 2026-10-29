import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, recordAuditLog } from "@/lib/admin-auth";

const MOCK_STUDENTS = [
  {
    id: "stu-001",
    username: "aditya_stan",
    email: "aditya.pratama@gmail.com",
    isActive: true,
    profile: {
      fullName: "Aditya Pratama Putra",
      phone: "081234567890",
      city: "Surabaya",
      province: "Jawa Timur",
      targetSchool: "PKN STAN",
    },
    tryoutsCompleted: 4,
    averageScore: 432,
    sessions: [
      {
        id: "sess-01",
        deviceId: "dev-macbook-m2-8a9b",
        deviceInfo: "Chrome 128 / macOS Sequoia 15.1",
        ipAddress: "182.253.110.45 (Telkomsel IndiHome)",
        isActive: true,
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
    ],
  },
  {
    id: "stu-002",
    username: "siti_nur",
    email: "siti.nurhaliza@gmail.com",
    isActive: true,
    profile: {
      fullName: "Siti Nurhaliza",
      phone: "081398765432",
      city: "Bandung",
      province: "Jawa Barat",
      targetSchool: "STIS",
    },
    tryoutsCompleted: 3,
    averageScore: 425,
    sessions: [
      {
        id: "sess-02",
        deviceId: "dev-win11-7c2d",
        deviceInfo: "Edge 129 / Windows 11",
        ipAddress: "36.72.190.12 (Biznet Fiber)",
        isActive: true,
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
  },
  {
    id: "stu-003",
    username: "rian_ipdn",
    email: "rian.hidayat@gmail.com",
    isActive: true,
    profile: {
      fullName: "Rian Hidayatullah",
      phone: "082155443322",
      city: "Medan",
      province: "Sumatera Utara",
      targetSchool: "IPDN",
    },
    tryoutsCompleted: 5,
    averageScore: 418,
    sessions: [
      {
        id: "sess-03",
        deviceId: "dev-iphone-15pro",
        deviceInfo: "Safari Mobile / iOS 18.0",
        ipAddress: "114.125.77.89 (XL Axiata)",
        isActive: true,
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let students: any[] = [];
    try {
      const where: any = { role: "STUDENT" };
      if (search) {
        where.OR = [
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { profile: { fullName: { contains: search, mode: "insensitive" } } },
        ];
      }

      const dbUsers = await prisma.user.findMany({
        where,
        include: {
          profile: true,
          sessions: {
            where: { isActive: true },
            orderBy: { lastActiveAt: "desc" },
            take: 3,
          },
          examSessions: {
            where: { isCompleted: true },
            select: { totalScore: true },
          },
        },
        take: 50,
      });

      if (dbUsers.length > 0) {
        students = dbUsers.map((u) => {
          const completedCount = u.examSessions.length;
          const totalScores = u.examSessions.reduce((acc, curr) => acc + curr.totalScore, 0);
          const avgScore = completedCount > 0 ? Math.round(totalScores / completedCount) : 0;

          return {
            id: u.id,
            username: u.username,
            email: u.email,
            isActive: u.isActive,
            profile: u.profile,
            tryoutsCompleted: completedCount,
            averageScore: avgScore,
            sessions: u.sessions,
          };
        });
      }
    } catch (err) {
      console.warn("DB students fetch error, falling back:", err);
    }

    if (students.length === 0) {
      students = MOCK_STUDENTS;
    }

    return NextResponse.json({ students });
  } catch (error: any) {
    console.error("GET /api/admin/students error:", error);
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
    const { action, userId } = body;

    if (action === "RESET_SESSIONS") {
      // Invalidate all active sessions for this student
      await prisma.authSession.updateMany({
        where: { userId },
        data: { isActive: false },
      });

      await recordAuditLog(admin.id, "FORCE_LOGOUT_STUDENT", "User", userId, {
        reason: "Admin session revocation / anti-sharing enforcement",
      });

      return NextResponse.json({ success: true, message: "Sesi perangkat siswa berhasil direset" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/admin/students error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

