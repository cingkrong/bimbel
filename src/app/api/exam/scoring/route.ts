import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID wajib disertakan." }, { status: 400 });
    }

    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        tryout: {
          include: {
            questions: {
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
        answers: true,
      },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: "Sesi ujian tidak valid." }, { status: 404 });
    }

    let scoreTwk = 0;
    let scoreTiu = 0;
    let scoreTkp = 0;

    const answerMap = new Map<number, string | null>();
    session.answers.forEach((ans) => {
      answerMap.set(ans.questionNumber, ans.selectedOptionId);
    });

    const mistakeQuestionIds: string[] = [];

    // Calculate score for each question
    for (const tq of session.tryout.questions) {
      const qNum = tq.questionNumber;
      const question = tq.question;
      const selectedOptionId = answerMap.get(qNum);

      let earned = 0;

      if (selectedOptionId) {
        const chosen = question.options.find((opt) => opt.id === selectedOptionId);
        if (chosen) {
          earned = chosen.score;
        }
      }

      // Update score in examAnswer
      if (selectedOptionId) {
        await prisma.examAnswer.update({
          where: {
            sessionId_questionNumber: {
              sessionId,
              questionNumber: qNum,
            },
          },
          data: { scoreEarned: earned },
        });
      }

      // Categorize score by subtest
      if (question.subtest === "TWK") {
        scoreTwk += earned;
        if (earned === 0) {
          mistakeQuestionIds.push(question.id);
        }
      } else if (question.subtest === "TIU") {
        scoreTiu += earned;
        if (earned === 0) {
          mistakeQuestionIds.push(question.id);
        }
      } else if (question.subtest === "TKP") {
        scoreTkp += earned;
        // In TKP, if not getting the maximum 5 points, record to mistake notebook for review
        if (earned < 5) {
          mistakeQuestionIds.push(question.id);
        }
      }
    }

    const totalScore = scoreTwk + scoreTiu + scoreTkp;
    const isPassed =
      scoreTwk >= session.tryout.passingGradeTwk &&
      scoreTiu >= session.tryout.passingGradeTiu &&
      scoreTkp >= session.tryout.passingGradeTkp;

    // Automatically record mistakes into student MistakeNotebook
    for (const qId of mistakeQuestionIds) {
      await prisma.mistakeNotebook.upsert({
        where: {
          userId_questionId: {
            userId: user.id,
            questionId: qId,
          },
        },
        update: {
          isReviewed: false,
        },
        create: {
          userId: user.id,
          questionId: qId,
          isReviewed: false,
        },
      });
    }

    // Update ExamSession
    const updatedSession = await prisma.examSession.update({
      where: { id: sessionId },
      data: {
        scoreTwk,
        scoreTiu,
        scoreTkp,
        totalScore,
        isPassed,
        isCompleted: true,
        completedAt: new Date(),
        durationLeftSec: 0,
      },
    });

    return NextResponse.json({
      success: true,
      result: {
        sessionId: updatedSession.id,
        tryoutId: session.tryoutId,
        scoreTwk,
        scoreTiu,
        scoreTkp,
        totalScore,
        isPassed,
        passingGradeTwk: session.tryout.passingGradeTwk,
        passingGradeTiu: session.tryout.passingGradeTiu,
        passingGradeTkp: session.tryout.passingGradeTkp,
        completedAt: updatedSession.completedAt,
      },
    });
  } catch (err: any) {
    console.error("Scoring error:", err);
    return NextResponse.json({ error: "Gagal menghitung skor ujian." }, { status: 500 });
  }
}

