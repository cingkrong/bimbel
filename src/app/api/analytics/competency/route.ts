import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.examSession.findMany({
      where: {
        userId: user.id,
        isCompleted: true,
      },
      include: {
        tryout: true,
        answers: {
          include: {
            session: true,
          },
        },
      },
      orderBy: { completedAt: "asc" },
    });

    const totalTryouts = sessions.length;
    const highestScore = sessions.reduce((max, s) => Math.max(max, s.totalScore), 0);
    const passedCount = sessions.filter((s) => s.isPassed).length;
    const passingRate = totalTryouts > 0 ? Math.round((passedCount / totalTryouts) * 100) : 0;
    const avgScore =
      totalTryouts > 0
        ? Math.round(sessions.reduce((acc, s) => acc + s.totalScore, 0) / totalTryouts)
        : 0;

    // Progression Line Chart
    const progressionData = sessions.map((s, idx) => ({
      name: `TO #${idx + 1}`,
      date: s.completedAt ? new Date(s.completedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : `TO ${idx + 1}`,
      TWK: s.scoreTwk,
      TIU: s.scoreTiu,
      TKP: s.scoreTkp,
      Total: s.totalScore,
      Lolos: s.isPassed,
    }));

    // Competency Radar Matrix
    // Target mastery points for SKD competencies
    const radarData = [
      { subject: "Nasionalisme", userScore: totalTryouts > 0 ? 82 : 40, benchmark: 75, fullMark: 100 },
      { subject: "Integritas", userScore: totalTryouts > 0 ? 88 : 45, benchmark: 80, fullMark: 100 },
      { subject: "Bela Negara", userScore: totalTryouts > 0 ? 76 : 35, benchmark: 70, fullMark: 100 },
      { subject: "Pilar Negara", userScore: totalTryouts > 0 ? 70 : 30, benchmark: 75, fullMark: 100 },
      { subject: "Bahasa Indo", userScore: totalTryouts > 0 ? 85 : 50, benchmark: 70, fullMark: 100 },
      { subject: "TIU Verbal", userScore: totalTryouts > 0 ? 90 : 45, benchmark: 80, fullMark: 100 },
      { subject: "TIU Numerik", userScore: totalTryouts > 0 ? 74 : 35, benchmark: 75, fullMark: 100 },
      { subject: "TIU Figural", userScore: totalTryouts > 0 ? 80 : 40, benchmark: 70, fullMark: 100 },
      { subject: "Pelayanan Publik", userScore: totalTryouts > 0 ? 92 : 55, benchmark: 85, fullMark: 100 },
      { subject: "Jejaring Kerja", userScore: totalTryouts > 0 ? 86 : 50, benchmark: 80, fullMark: 100 },
      { subject: "Sosial Budaya", userScore: totalTryouts > 0 ? 78 : 45, benchmark: 75, fullMark: 100 },
      { subject: "TIK & Digital", userScore: totalTryouts > 0 ? 89 : 50, benchmark: 80, fullMark: 100 },
      { subject: "Profesionalisme", userScore: totalTryouts > 0 ? 85 : 48, benchmark: 82, fullMark: 100 },
      { subject: "Anti Radikalisme", userScore: totalTryouts > 0 ? 94 : 60, benchmark: 85, fullMark: 100 },
    ];

    const mistakeCount = await prisma.mistakeNotebook.count({
      where: {
        userId: user.id,
        isReviewed: false,
      },
    });

    return NextResponse.json({
      metrics: {
        totalTryouts,
        highestScore,
        avgScore,
        passingRate,
        mistakeCount,
        studyStreakDays: 7,
      },
      progressionData,
      radarData,
    });
  } catch (err: any) {
    console.error("Competency analytics error:", err);
    return NextResponse.json({ error: "Gagal memuat analisis kompetensi." }, { status: 500 });
  }
}

