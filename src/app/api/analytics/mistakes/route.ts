import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mistakes = await prisma.mistakeNotebook.findMany({
      where: { userId: user.id },
      include: {
        question: {
          include: {
            options: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      mistakes: mistakes.map((m) => ({
        id: m.id,
        questionId: m.questionId,
        isReviewed: m.isReviewed,
        subtest: m.question.subtest,
        topic: m.question.topic,
        questionText: m.question.questionText,
        discussionText: m.question.discussionText,
        options: m.question.options.sort((a, b) => a.optionLabel.localeCompare(b.optionLabel)),
      })),
    });
  } catch (err: any) {
    console.error("Mistakes load error:", err);
    return NextResponse.json({ error: "Gagal memuat catatan kesalahan." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mistakeId, isReviewed } = await req.json();
    if (!mistakeId) {
      return NextResponse.json({ error: "Mistake ID wajib disertakan." }, { status: 400 });
    }

    const updated = await prisma.mistakeNotebook.update({
      where: { id: mistakeId },
      data: {
        isReviewed: Boolean(isReviewed),
        lastReviewedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    console.error("Update mistake status error:", err);
    return NextResponse.json({ error: "Gagal memperbarui status catatan." }, { status: 500 });
  }
}

