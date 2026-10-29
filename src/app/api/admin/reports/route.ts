import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, recordAuditLog } from "@/lib/admin-auth";

const MOCK_QUESTION_REPORTS = [
  {
    id: "rep-001",
    reportType: "Kunci Jawaban Salah",
    notes: "Pada opsi B tertulis sila ke-2, padahal nilai tenggang rasa dan kerukunan agama lebih condong ke sila 1 atau sila 3. Mohon diverifikasi kembali.",
    status: "PENDING",
    adminNotes: null,
    createdAt: "2026-10-28T09:15:00Z",
    user: {
      username: "aditya_stan",
      email: "aditya.pratama@gmail.com",
      profile: { fullName: "Aditya Pratama Putra" },
    },
    question: {
      id: "q-twk-001",
      subtest: "TWK",
      topic: "Pancasila & Hubungan Antar Sila",
      questionText: "Sikap saling menghormati dan bekerja sama antarumat beragama yang berbeda-beda sehingga terbina kerukunan hidup, sejalan dengan pengamalan nilai Pancasila khususnya...",
      discussionText: "Menghormati kebebasan beribadah dan membina kerukunan antarumat beragama adalah manifestasi luhur dari Sila ke-1 Pancasila: Ketuhanan Yang Maha Esa.",
      options: [
        { id: "opt-1", optionLabel: "A", optionText: "Sila Pertama: Ketuhanan Yang Maha Esa", score: 5, isCorrect: true },
        { id: "opt-2", optionLabel: "B", optionText: "Sila Kedua: Kemanusiaan yang Adil dan Beradab", score: 0, isCorrect: false },
        { id: "opt-3", optionLabel: "C", optionText: "Sila Ketiga: Persatuan Indonesia", score: 0, isCorrect: false },
        { id: "opt-4", optionLabel: "D", optionText: "Sila Keempat: Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan", score: 0, isCorrect: false },
        { id: "opt-5", optionLabel: "E", optionText: "Sila Kelima: Keadilan Sosial bagi Seluruh Rakyat Indonesia", score: 0, isCorrect: false },
      ],
    },
  },
  {
    id: "rep-002",
    reportType: "Soal Ambiguitas",
    notes: "Premis silogisme pada kalimat ke-2 membingungkan karena tidak ada negasi yang eksplisit.",
    status: "RESOLVED",
    adminNotes: "Soal telah direvisi untuk memperjelas konteks premis mayor dan minor.",
    createdAt: "2026-10-27T11:20:00Z",
    user: {
      username: "siti_nur",
      email: "siti.nurhaliza@gmail.com",
      profile: { fullName: "Siti Nurhaliza" },
    },
    question: {
      id: "q-tiu-001",
      subtest: "TIU",
      topic: "Silogisme Logika Posisi",
      questionText: "Semua calon praja IPDN memiliki fisik yang prima. Sebagian mahasiswa yang memiliki fisik prima gemar mendaki gunung. Kesimpulan yang paling tepat adalah...",
      discussionText: "Sebagian calon praja IPDN yang memiliki fisik prima gemar mendaki gunung.",
      options: [
        { id: "opt-6", optionLabel: "A", optionText: "Semua calon praja IPDN gemar mendaki gunung", score: 0, isCorrect: false },
        { id: "opt-7", optionLabel: "B", optionText: "Sebagian calon praja IPDN gemar mendaki gunung", score: 5, isCorrect: true },
        { id: "opt-8", optionLabel: "C", optionText: "Semua yang gemar mendaki gunung adalah calon praja IPDN", score: 0, isCorrect: false },
        { id: "opt-9", optionLabel: "D", optionText: "Tidak ada calon praja IPDN yang gemar mendaki gunung", score: 0, isCorrect: false },
        { id: "opt-10", optionLabel: "E", optionText: "Fisik prima hanya dimiliki oleh pendaki gunung", score: 0, isCorrect: false },
      ],
    },
  },
];

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let reports: any[] = [];
    try {
      const where: any = {};
      if (status && status !== "ALL") {
        where.status = status;
      }

      const dbReports = await prisma.questionReport.findMany({
        where,
        include: {
          user: {
            select: {
              username: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
          question: {
            include: {
              options: { orderBy: { optionLabel: "asc" } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (dbReports.length > 0) {
        reports = dbReports;
      }
    } catch (err) {
      console.warn("DB question report fetch error, falling back:", err);
    }

    if (reports.length === 0) {
      reports = MOCK_QUESTION_REPORTS;
      if (status && status !== "ALL") {
        reports = reports.filter((r) => r.status === status);
      }
    }

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error("GET /api/admin/reports error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { reportId, status, adminNotes, questionId, newCorrectLabel, revisedDiscussion } = body;

    if (!reportId || !status) {
      return NextResponse.json({ error: "Report ID and status wajib diisi" }, { status: 400 });
    }

    // If there's an update to the question's answer key or discussion
    if (questionId && (newCorrectLabel || revisedDiscussion)) {
      if (revisedDiscussion) {
        await prisma.questionBank.update({
          where: { id: questionId },
          data: { discussionText: revisedDiscussion },
        });
      }

      if (newCorrectLabel) {
        // Reset old correct options
        await prisma.questionOption.updateMany({
          where: { questionId },
          data: { isCorrect: false, score: 0 },
        });

        // Set new correct option
        await prisma.questionOption.updateMany({
          where: { questionId, optionLabel: newCorrectLabel },
          data: { isCorrect: true, score: 5 },
        });
      }
    }

    const updatedReport = await prisma.questionReport.update({
      where: { id: reportId },
      data: {
        status,
        adminNotes: adminNotes || null,
        resolvedById: admin.id,
        resolvedAt: new Date(),
      },
    });

    await recordAuditLog(
      admin.id,
      "RESOLVE_QUESTION_REPORT",
      "QuestionReport",
      reportId,
      { status, questionId }
    );

    return NextResponse.json({ report: updatedReport });
  } catch (error: any) {
    console.error("PUT /api/admin/reports error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

