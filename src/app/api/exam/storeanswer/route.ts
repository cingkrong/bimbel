import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, questionNumber, selectedOptionId, isDoubtful, durationLeftSec } = body;

    if (!sessionId || questionNumber === undefined) {
      return NextResponse.json({ error: "Payload autosave tidak valid." }, { status: 400 });
    }

    // Verify session ownership and active status
    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 403 });
    }

    if (session.isCompleted) {
      return NextResponse.json({ error: "Ujian telah selesai." }, { status: 400 });
    }

    // Upsert the answer
    await prisma.examAnswer.upsert({
      where: {
        sessionId_questionNumber: {
          sessionId,
          questionNumber,
        },
      },
      update: {
        selectedOptionId,
        isDoubtful: Boolean(isDoubtful),
        answeredAt: new Date(),
      },
      create: {
        sessionId,
        userId: user.id,
        questionNumber,
        selectedOptionId,
        isDoubtful: Boolean(isDoubtful),
      },
    });

    // Update remaining timer
    if (typeof durationLeftSec === "number" && durationLeftSec >= 0) {
      await prisma.examSession.update({
        where: { id: sessionId },
        data: { durationLeftSec },
      });
    }

    return NextResponse.json({ success: true, savedAt: new Date() });
  } catch (err: any) {
    console.error("Autosave answer error:", err);
    return NextResponse.json({ error: "Gagal menyimpan jawaban." }, { status: 500 });
  }
}

