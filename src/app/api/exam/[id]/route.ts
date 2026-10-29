import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { id: tryoutId } = await params;

    const tryout = await prisma.tryoutPackage.findUnique({
      where: { id: tryoutId },
      include: {
        questions: {
          orderBy: { questionNumber: "asc" },
          include: {
            question: {
              include: {
                options: {
                  select: {
                    id: true,
                    optionLabel: true,
                    optionText: true,
                    optionImage: true,
                    // Score and isCorrect are intentionally omitted during active exam
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tryout) {
      return NextResponse.json({ error: "Paket tryout tidak ditemukan." }, { status: 404 });
    }

    // Find existing session or create a new one
    let session = await prisma.examSession.findFirst({
      where: {
        tryoutId,
        userId: user.id,
      },
      include: {
        answers: true,
      },
      orderBy: { startedAt: "desc" },
    });

    if (!session || session.isCompleted) {
      // Start fresh session (100 minutes = 6000 seconds)
      session = await prisma.examSession.create({
        data: {
          tryoutId,
          userId: user.id,
          durationLeftSec: tryout.durationMinutes * 60,
          isCompleted: false,
        },
        include: {
          answers: true,
        },
      });
    }

    // Transform questions into structured format
    const formattedQuestions = tryout.questions.map((tq) => ({
      questionNumber: tq.questionNumber,
      questionId: tq.question.id,
      subtest: tq.question.subtest,
      topic: tq.question.topic,
      questionText: tq.question.questionText,
      questionImage: tq.question.questionImage,
      options: tq.question.options.sort((a, b) => a.optionLabel.localeCompare(b.optionLabel)),
    }));

    return NextResponse.json({
      tryout: {
        id: tryout.id,
        title: tryout.title,
        durationMinutes: tryout.durationMinutes,
        totalQuestions: tryout.totalQuestions,
        passingGradeTwk: tryout.passingGradeTwk,
        passingGradeTiu: tryout.passingGradeTiu,
        passingGradeTkp: tryout.passingGradeTkp,
      },
      session: {
        id: session.id,
        durationLeftSec: session.durationLeftSec,
        isCompleted: session.isCompleted,
        answers: session.answers.map((ans) => ({
          questionNumber: ans.questionNumber,
          selectedOptionId: ans.selectedOptionId,
          isDoubtful: ans.isDoubtful,
        })),
      },
      questions: formattedQuestions,
    });
  } catch (err: any) {
    console.error("Exam load error:", err);
    return NextResponse.json({ error: "Gagal memuat ujian CAT." }, { status: 500 });
  }
}

