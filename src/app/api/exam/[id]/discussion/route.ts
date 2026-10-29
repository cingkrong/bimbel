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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tryoutId } = await params;

    const session = await prisma.examSession.findFirst({
      where: {
        tryoutId,
        userId: user.id,
        isCompleted: true,
      },
      include: {
        answers: true,
        tryout: {
          include: {
            questions: {
              orderBy: { questionNumber: "asc" },
              include: {
                question: {
                  include: {
                    options: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Sesi ujian yang telah selesai tidak ditemukan." },
        { status: 404 }
      );
    }

    const answerMap = new Map();
    session.answers.forEach((ans) => {
      answerMap.set(ans.questionNumber, ans);
    });

    const discussionItems = session.tryout.questions.map((tq) => {
      const q = tq.question;
      const userAns = answerMap.get(tq.questionNumber);
      const selectedOptionId = userAns?.selectedOptionId || null;
      const isDoubtful = userAns?.isDoubtful || false;
      const scoreEarned = userAns?.scoreEarned ?? 0;

      const isAnswered = selectedOptionId !== null;
      let isCorrect = false;

      if (q.subtest === "TKP") {
        isCorrect = scoreEarned === 5;
      } else {
        const correctOpt = q.options.find((opt) => opt.isCorrect);
        isCorrect = correctOpt ? correctOpt.id === selectedOptionId : false;
      }

      return {
        questionNumber: tq.questionNumber,
        questionId: q.id,
        subtest: q.subtest,
        topic: q.topic,
        questionText: q.questionText,
        questionImage: q.questionImage,
        discussionText: q.discussionText,
        selectedOptionId,
        isDoubtful,
        isAnswered,
        isCorrect,
        scoreEarned,
        options: q.options.sort((a, b) => a.optionLabel.localeCompare(b.optionLabel)),
      };
    });

    return NextResponse.json({
      summary: {
        tryoutTitle: session.tryout.title,
        scoreTwk: session.scoreTwk,
        scoreTiu: session.scoreTiu,
        scoreTkp: session.scoreTkp,
        totalScore: session.totalScore,
        isPassed: session.isPassed,
        passingGradeTwk: session.tryout.passingGradeTwk,
        passingGradeTiu: session.tryout.passingGradeTiu,
        passingGradeTkp: session.tryout.passingGradeTkp,
        completedAt: session.completedAt,
      },
      questions: discussionItems,
    });
  } catch (err: any) {
    console.error("Discussion load error:", err);
    return NextResponse.json({ error: "Gagal memuat pembahasan ujian." }, { status: 500 });
  }
}

