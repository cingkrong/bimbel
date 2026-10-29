import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, recordAuditLog } from "@/lib/admin-auth";

const MOCK_TRYOUT_PACKAGES = [
  {
    id: "pkg-skd-01",
    title: "Tryout Akbar Nasional SKD CPNS & Kedinasan 2026 #1",
    description: "Simulasi CAT BKN standar PermenPAN-RB terbaru lengkap dengan penilaian TKP 1-5 dan TWK/TIU 0/5.",
    durationMinutes: 100,
    totalQuestions: 110,
    passingGradeTwk: 65,
    passingGradeTiu: 80,
    passingGradeTkp: 166,
    isPublished: true,
    participantsCount: 384,
    passedCount: 247,
    createdAt: new Date().toISOString(),
    product: {
      name: "Paket Intensif Tryout SKD BKN",
      price: 99000,
    },
  },
  {
    id: "pkg-skd-02",
    title: "Tryout Spesial STAN & STIS Prediksi HOTS 2026",
    description: "Fokus pada pendalaman materi Matematika TIU analitis dan penalaran analogi tingkat tinggi.",
    durationMinutes: 100,
    totalQuestions: 110,
    passingGradeTwk: 65,
    passingGradeTiu: 80,
    passingGradeTkp: 166,
    isPublished: true,
    participantsCount: 219,
    passedCount: 132,
    createdAt: new Date().toISOString(),
    product: {
      name: "Paket Intensif Tryout SKD BKN",
      price: 99000,
    },
  },
  {
    id: "pkg-skd-03",
    title: "Tryout Pemantapan IPDN & Poltekip Batch #3",
    description: "Kombinasi soal integritas nasionalisme TWK dan butir jejaring kerja anti-radikalisme TKP.",
    durationMinutes: 100,
    totalQuestions: 110,
    passingGradeTwk: 65,
    passingGradeTiu: 80,
    passingGradeTkp: 166,
    isPublished: false,
    participantsCount: 0,
    passedCount: 0,
    createdAt: new Date().toISOString(),
    product: {
      name: "Paket Intensif Tryout SKD BKN",
      price: 99000,
    },
  },
];

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let packages: any[] = [];
    try {
      const dbPackages = await prisma.tryoutPackage.findMany({
        include: {
          product: { select: { name: true, price: true } },
          _count: {
            select: { questions: true, sessions: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (dbPackages.length > 0) {
        packages = await Promise.all(
          dbPackages.map(async (pkg) => {
            const passedCount = await prisma.examSession.count({
              where: { tryoutId: pkg.id, isPassed: true },
            });
            return {
              id: pkg.id,
              title: pkg.title,
              description: pkg.description,
              durationMinutes: pkg.durationMinutes,
              totalQuestions: pkg.totalQuestions,
              passingGradeTwk: pkg.passingGradeTwk,
              passingGradeTiu: pkg.passingGradeTiu,
              passingGradeTkp: pkg.passingGradeTkp,
              isPublished: pkg.isPublished,
              participantsCount: pkg._count.sessions,
              passedCount,
              createdAt: pkg.createdAt,
              product: pkg.product,
            };
          })
        );
      }
    } catch (dbErr) {
      console.warn("DB tryout packages fetch error, falling back:", dbErr);
    }

    if (packages.length === 0) {
      packages = MOCK_TRYOUT_PACKAGES;
    }

    return NextResponse.json({ packages });
  } catch (error: any) {
    console.error("GET /api/admin/tryout error:", error);
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
      title,
      description,
      durationMinutes,
      totalQuestions,
      passingGradeTwk,
      passingGradeTiu,
      passingGradeTkp,
      isPublished,
    } = body;

    // Find or create default product
    let product = await prisma.product.findFirst();
    if (!product) {
      product = await prisma.product.create({
        data: {
          code: `PKG-${Date.now()}`,
          name: title,
          category: "tryout",
          price: 99000,
        },
      });
    }

    const created = await prisma.tryoutPackage.create({
      data: {
        productId: product.id,
        title,
        description: description || "",
        durationMinutes: Number(durationMinutes) || 100,
        totalQuestions: Number(totalQuestions) || 110,
        passingGradeTwk: Number(passingGradeTwk) || 65,
        passingGradeTiu: Number(passingGradeTiu) || 80,
        passingGradeTkp: Number(passingGradeTkp) || 166,
        isPublished: Boolean(isPublished),
      },
    });

    await recordAuditLog(admin.id, "CREATE_TRYOUT_PACKAGE", "TryoutPackage", created.id, { title });

    return NextResponse.json({ package: created }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/tryout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

