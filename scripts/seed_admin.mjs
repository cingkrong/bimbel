import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Admin Users & Operational Data...");

  const passwordHash = await bcrypt.hash("admin123", 10);

  const admins = [
    {
      email: "superadmin@loloskampus.com",
      name: "Bagas Pratama (Superadmin)",
      role: "SUPERADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    },
    {
      email: "akademik@loloskampus.com",
      name: "Siti Rahmawati (Tim Akademik CAT)",
      role: "ACADEMIC_ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
    },
    {
      email: "tutor@loloskampus.com",
      name: "Dr. Pratama Putra, M.Pd (Master Tutor)",
      role: "TUTOR",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    },
    {
      email: "finance@loloskampus.com",
      name: "Dewi Anggraini (Finance Officer)",
      role: "FINANCE",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
    },
  ];

  for (const adm of admins) {
    await prisma.adminUser.upsert({
      where: { email: adm.email },
      update: {
        name: adm.name,
        role: adm.role,
        passwordHash,
        avatarUrl: adm.avatarUrl,
      },
      create: {
        email: adm.email,
        name: adm.name,
        role: adm.role,
        passwordHash,
        avatarUrl: adm.avatarUrl,
      },
    });
  }

  console.log("✅ Admin accounts created (password: admin123)");

  // Link Bimbel class to Tutor
  const tutorUser = await prisma.adminUser.findUnique({
    where: { email: "tutor@loloskampus.com" },
  });
  if (tutorUser) {
    await prisma.bimbelClass.updateMany({
      data: { tutorId: tutorUser.id },
    });
  }

  // Create sample question reports for demonstration
  const sampleQuestion = await prisma.questionBank.findFirst();
  const sampleStudent = await prisma.user.findFirst({ where: { role: "STUDENT" } });

  if (sampleQuestion && sampleStudent) {
    await prisma.questionReport.upsert({
      where: { id: "rep-demo-01" },
      update: {},
      create: {
        id: "rep-demo-01",
        userId: sampleStudent.id,
        questionId: sampleQuestion.id,
        reportType: "Kunci Jawaban Salah",
        notes: "Menurut saya opsi B lebih tepat karena merujuk pada ketahanan nasional secara umum bukan hanya budaya.",
        status: "PENDING",
      },
    });

    await prisma.questionReport.upsert({
      where: { id: "rep-demo-02" },
      update: {},
      create: {
        id: "rep-demo-02",
        userId: sampleStudent.id,
        questionId: sampleQuestion.id,
        reportType: "Soal Ambiguitas",
        notes: "Pilihan kata pada premis nomor 2 sedikit membingungkan.",
        status: "RESOLVED",
        resolvedById: tutorUser?.id,
        adminNotes: "Sudah diperbaiki dan kalimat premis disederhanakan.",
      },
    });
  }

  // Create sample affiliate payout request
  const sampleRef = await prisma.referralCode.findFirst();
  if (sampleRef) {
    await prisma.affiliatePayout.upsert({
      where: { id: "payout-demo-01" },
      update: {},
      create: {
        id: "payout-demo-01",
        referralCodeId: sampleRef.id,
        userId: sampleRef.userId,
        amount: 75000,
        bankName: "BCA",
        accountNumber: "8801234567",
        accountHolder: "Fajar Prasetyo",
        status: "PENDING",
        notes: "Penarikan komisi 3 referral paket tryout",
      },
    });
  }

  // Create initial audit log
  const superAdmin = await prisma.adminUser.findUnique({
    where: { email: "superadmin@loloskampus.com" },
  });
  if (superAdmin) {
    await prisma.auditLog.create({
      data: {
        adminId: superAdmin.id,
        action: "INITIALIZE_ADMIN_PANEL",
        targetEntity: "System",
        targetId: "GLOBAL_CONFIG",
        detailsJson: JSON.stringify({ message: "Admin Operations Dashboard initialized" }),
        ipAddress: "127.0.0.1",
      },
    });
  }

  console.log("🎉 Admin seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Admin seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

