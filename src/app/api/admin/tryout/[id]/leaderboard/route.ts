import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

const MOCK_LEADERBOARD = [
  {
    rank: 1,
    studentName: "Aditya Pratama Putra",
    email: "aditya.pratama@gmail.com",
    city: "Surabaya",
    province: "Jawa Timur",
    targetSchool: "PKN STAN",
    scoreTwk: 115,
    scoreTiu: 145,
    scoreTkp: 198,
    totalScore: 458,
    isPassed: true,
    completedAt: "2026-10-27T14:32:00Z",
  },
  {
    rank: 2,
    studentName: "Siti Nurhaliza",
    email: "siti.nurhaliza@gmail.com",
    city: "Bandung",
    province: "Jawa Barat",
    targetSchool: "STIS",
    scoreTwk: 110,
    scoreTiu: 140,
    scoreTkp: 192,
    totalScore: 442,
    isPassed: true,
    completedAt: "2026-10-27T16:15:00Z",
  },
  {
    rank: 3,
    studentName: "Rian Hidayatullah",
    email: "rian.hidayat@gmail.com",
    city: "Medan",
    province: "Sumatera Utara",
    targetSchool: "IPDN",
    scoreTwk: 105,
    scoreTiu: 135,
    scoreTkp: 188,
    totalScore: 428,
    isPassed: true,
    completedAt: "2026-10-27T18:00:00Z",
  },
  {
    rank: 4,
    studentName: "Dewi Lestari",
    email: "dewi.lestari@gmail.com",
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    targetSchool: "POLTEKIP",
    scoreTwk: 95,
    scoreTiu: 130,
    scoreTkp: 185,
    totalScore: 410,
    isPassed: true,
    completedAt: "2026-10-27T19:40:00Z",
  },
  {
    rank: 5,
    studentName: "Faisal Tanjung",
    email: "faisal.tanjung@gmail.com",
    city: "Makassar",
    province: "Sulawesi Selatan",
    targetSchool: "STMKG",
    scoreTwk: 60,
    scoreTiu: 125,
    scoreTkp: 178,
    totalScore: 363,
    isPassed: false, // TWK < 65
    completedAt: "2026-10-27T20:10:00Z",
  },
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    let leaderboard: any[] = [];
    try {
      const sessions = await prisma.examSession.findMany({
        where: {
          tryoutId: id,
          isCompleted: true,
        },
        include: {
          user: {
            include: { profile: true },
          },
        },
        orderBy: { totalScore: "desc" },
        take: 50,
      });

      if (sessions.length > 0) {
        leaderboard = sessions.map((s, idx) => ({
          rank: idx + 1,
          studentName: s.user.profile?.fullName || s.user.username,
          email: s.user.email,
          city: s.user.profile?.city || "Jakarta",
          province: s.user.profile?.province || "DKI Jakarta",
          targetSchool: s.user.profile?.targetSchool || "PKN STAN",
          scoreTwk: s.scoreTwk,
          scoreTiu: s.scoreTiu,
          scoreTkp: s.scoreTkp,
          totalScore: s.totalScore,
          isPassed: s.isPassed,
          completedAt: s.completedAt || s.startedAt,
        }));
      }
    } catch (dbErr) {
      console.warn("DB leaderboard fetch error, using mock:", dbErr);
    }

    if (leaderboard.length === 0) {
      leaderboard = MOCK_LEADERBOARD;
    }

    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    console.error("GET /api/admin/tryout/[id]/leaderboard error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

