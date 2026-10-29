import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, recordAuditLog } from "@/lib/admin-auth";

const MOCK_QUESTIONS_FALLBACK = [
  {
    id: "q-twk-001",
    subtest: "TWK",
    topic: "Pancasila",
    subTopic: "Pengamalan Sila ke-2",
    difficulty: "MEDIUM",
    questionText: "Sikap saling menghormati dan bekerja sama antarumat beragama yang berbeda-beda sehingga terbina kerukunan hidup, sejalan dengan pengamalan nilai Pancasila khususnya...",
    questionImage: null,
    discussionText: "Menghormati kebebasan beribadah dan membina kerukunan antarumat beragama adalah manifestasi luhur dari Sila ke-1 Pancasila: Ketuhanan Yang Maha Esa.",
    discussionImage: null,
    isVerified: true,
    createdAt: new Date().toISOString(),
    options: [
      { id: "opt-1", optionLabel: "A", optionText: "Sila Pertama: Ketuhanan Yang Maha Esa", score: 5, isCorrect: true },
      { id: "opt-2", optionLabel: "B", optionText: "Sila Kedua: Kemanusiaan yang Adil dan Beradab", score: 0, isCorrect: false },
      { id: "opt-3", optionLabel: "C", optionText: "Sila Ketiga: Persatuan Indonesia", score: 0, isCorrect: false },
      { id: "opt-4", optionLabel: "D", optionText: "Sila Keempat: Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan", score: 0, isCorrect: false },
      { id: "opt-5", optionLabel: "E", optionText: "Sila Kelima: Keadilan Sosial bagi Seluruh Rakyat Indonesia", score: 0, isCorrect: false },
    ],
  },
  {
    id: "q-tiu-001",
    subtest: "TIU",
    topic: "Silogisme & Logika Posisi",
    subTopic: "Penarikan Kesimpulan",
    difficulty: "HARD",
    questionText: "Semua calon praja IPDN memiliki fisik yang prima. Sebagian mahasiswa yang memiliki fisik prima gemar mendaki gunung. Kesimpulan yang paling tepat adalah...",
    questionImage: null,
    discussionText: "Sebagian calon praja IPDN yang memiliki fisik prima gemar mendaki gunung. Tidak semua praja gemar mendaki, namun ada kemungkinan irisan antara praja fisik prima dengan pendaki gunung.",
    discussionImage: null,
    isVerified: true,
    createdAt: new Date().toISOString(),
    options: [
      { id: "opt-6", optionLabel: "A", optionText: "Semua calon praja IPDN gemar mendaki gunung", score: 0, isCorrect: false },
      { id: "opt-7", optionLabel: "B", optionText: "Sebagian calon praja IPDN gemar mendaki gunung", score: 5, isCorrect: true },
      { id: "opt-8", optionLabel: "C", optionText: "Semua yang gemar mendaki gunung adalah calon praja IPDN", score: 0, isCorrect: false },
      { id: "opt-9", optionLabel: "D", optionText: "Tidak ada calon praja IPDN yang gemar mendaki gunung", score: 0, isCorrect: false },
      { id: "opt-10", optionLabel: "E", optionText: "Fisik prima hanya dimiliki oleh pendaki gunung", score: 0, isCorrect: false },
    ],
  },
  {
    id: "q-tkp-001",
    subtest: "TKP",
    topic: "Jejaring Kerja & Kolaborasi",
    subTopic: "Komunikasi Tim Multikultural",
    difficulty: "HOTS",
    questionText: "Anda ditugaskan memimpin tim lintas divisi dengan latar belakang budaya dan gaya kerja yang sangat berbeda, sementara tenggat waktu pelaporan audit BPK tinggal 3 hari lagi. Sikap Anda adalah...",
    questionImage: null,
    discussionText: "Aspek Jejaring Kerja & Kepemimpinan: Tindakan terbaik adalah menyatukan persepsi melalui rapat taktis singkat berorientasi solusi, membagi beban kerja secara objektif, dan membuka kanal komunikasi real-time.",
    discussionImage: null,
    isVerified: true,
    createdAt: new Date().toISOString(),
    options: [
      { id: "opt-11", optionLabel: "A", optionText: "Mengadakan rapat taktis singkat untuk menyamakan persepsi, membagi tugas berdasarkan keahlian teknis, dan memantau progres tiap jam", score: 5, isCorrect: false },
      { id: "opt-12", optionLabel: "B", optionText: "Mengambil alih seluruh pekerjaan krusial secara mandiri agar audit selesai tepat waktu tanpa perdebatan", score: 3, isCorrect: false },
      { id: "opt-13", optionLabel: "C", optionText: "Menyerahkan delegasi kepada anggota tim yang paling senior dan melaporkan kendala kepada atasan", score: 2, isCorrect: false },
      { id: "opt-14", optionLabel: "D", optionText: "Membuat grup koordinasi digital dan mengingatkan seluruh anggota untuk bekerja lembur", score: 4, isCorrect: false },
      { id: "opt-15", optionLabel: "E", optionText: "Meminta perpanjangan waktu tenggat audit kepada pimpinan mengingat perbedaan karakteristik tim", score: 1, isCorrect: false },
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
    const subtest = searchParams.get("subtest"); // TWK, TIU, TKP
    const difficulty = searchParams.get("difficulty"); // EASY, MEDIUM, HARD, HOTS
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (subtest && subtest !== "ALL") {
      where.subtest = subtest;
    }
    if (difficulty && difficulty !== "ALL") {
      where.difficulty = difficulty;
    }
    if (search) {
      where.OR = [
        { topic: { contains: search, mode: "insensitive" } },
        { subTopic: { contains: search, mode: "insensitive" } },
        { questionText: { contains: search, mode: "insensitive" } },
      ];
    }

    let questions: any[] = [];
    let total = 0;

    try {
      [questions, total] = await Promise.all([
        prisma.questionBank.findMany({
          where,
          include: {
            options: {
              orderBy: { optionLabel: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.questionBank.count({ where }),
      ]);
    } catch (dbErr) {
      console.warn("DB QuestionBank fetch error, falling back to mock:", dbErr);
    }

    if (questions.length === 0 && !search && (!subtest || subtest === "ALL")) {
      questions = MOCK_QUESTIONS_FALLBACK;
      total = MOCK_QUESTIONS_FALLBACK.length;
    }

    return NextResponse.json({
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/questions error:", error);
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
    const {
      subtest,
      topic,
      subTopic,
      difficulty,
      questionText,
      questionImage,
      discussionText,
      options,
    } = body;

    if (!subtest || !topic || !questionText || !options || !Array.isArray(options)) {
      return NextResponse.json(
        { error: "Subtest, topik, teks soal, dan opsi jawaban wajib diisi" },
        { status: 400 }
      );
    }

    const created = await prisma.questionBank.create({
      data: {
        subtest,
        topic,
        subTopic: subTopic || null,
        difficulty: difficulty || "MEDIUM",
        questionText,
        questionImage: questionImage || null,
        discussionText: discussionText || "",
        isVerified: true,
        verifiedById: admin.id,
        options: {
          create: options.map((opt: any) => ({
            optionLabel: opt.optionLabel,
            optionText: opt.optionText,
            optionImage: opt.optionImage || null,
            score: Number(opt.score) || 0,
            isCorrect: Boolean(opt.isCorrect),
          })),
        },
      },
      include: {
        options: { orderBy: { optionLabel: "asc" } },
      },
    });

    await recordAuditLog(
      admin.id,
      "CREATE_QUESTION",
      "QuestionBank",
      created.id,
      { subtest, topic, difficulty }
    );

    return NextResponse.json({ question: created }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/questions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Question ID wajib disertakan" }, { status: 400 });
    }

    await prisma.questionBank.delete({
      where: { id },
    });

    await recordAuditLog(admin.id, "DELETE_QUESTION", "QuestionBank", id, {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/admin/questions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

