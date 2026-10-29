import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting production-grade database seed...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Users
  const student = await prisma.user.upsert({
    where: { email: "siswa@loloskampus.com" },
    update: {},
    create: {
      username: "siswajuara",
      email: "siswa@loloskampus.com",
      passwordHash,
      role: "STUDENT",
      profile: {
        create: {
          fullName: "Fajar Prasetyo",
          phone: "081234567890",
          city: "Jakarta Selatan",
          province: "DKI Jakarta",
          targetSchool: "PKN STAN - D4 Akuntansi Sektor Publik",
          gender: "MALE",
          birthDate: new Date("2006-05-14"),
        },
      },
      preferences: {
        create: {
          studyTime: "malam",
          learningStyle: "latihan",
          dailyDuration: "3_5",
          prepType: "kelas",
          sourceInfo: "Instagram",
        },
      },
      referralCode: {
        create: {
          code: "FAJARSTAN2026",
          commissionPct: 10.0,
        },
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@loloskampus.com" },
    update: {},
    create: {
      username: "adminmaster",
      email: "admin@loloskampus.com",
      passwordHash,
      role: "ADMIN",
      profile: {
        create: {
          fullName: "Administrator LolosKampus",
          phone: "08111222333",
          city: "Tangerang Selatan",
          province: "Banten",
          targetSchool: "PKN STAN",
          gender: "MALE",
        },
      },
    },
  });

  console.log("✅ Users created (siswa@loloskampus.com & admin@loloskampus.com / password123)");

  // 2. Create Products
  const tryoutProduct = await prisma.product.upsert({
    where: { code: "PROD-TO-01" },
    update: {},
    create: {
      code: "PROD-TO-01",
      name: "Paket 10x Tryout SKD Kedinasan & CPNS CAT BKN 2026",
      description: "Paket simulasi ujian CAT BKN berstandar PermenPAN-RB terbaru lengkap dengan perankingan nasional dan analisis radar kelemahan.",
      category: "tryout",
      periodText: "2026",
      price: 49000,
      coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
      benefits: {
        create: [
          { benefitText: "10 Paket Tryout SKD (110 Soal per Paket)", sortOrder: 1 },
          { benefitText: "Sistem CAT BKN Real-Time Timer & Autosave", sortOrder: 2 },
          { benefitText: "Analisis Radar Kompetensi & Mistake Notebook", sortOrder: 3 },
          { benefitText: "Perangkingan Nasional & Pembahasan Video/Teks", sortOrder: 4 },
        ],
      },
    },
  });

  const bimbelProduct = await prisma.product.upsert({
    where: { code: "PROD-BIMBEL-01" },
    update: {},
    create: {
      code: "PROD-BIMBEL-01",
      name: "Bimbel Intensif Lolos PKN STAN & Kedinasan 2026",
      description: "Program bimbingan belajar tatap muka daring interaktif via Zoom bersama master tutor alumni STAN & BKN.",
      category: "bimbel",
      periodText: "2026",
      price: 499000,
      coverImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
      benefits: {
        create: [
          { benefitText: "24 Sesi Live Zoom Eksklusif Interaktif", sortOrder: 1 },
          { benefitText: "Rekaman Video Kelas HD & Modul Materi PDF", sortOrder: 2 },
          { benefitText: "Grup Diskusi Mentoring WhatsApp & Telegram 24/7", sortOrder: 3 },
          { benefitText: "Tugas Terstruktur & Feedback Langsung Tutor", sortOrder: 4 },
        ],
      },
    },
  });

  const bundlingProduct = await prisma.product.upsert({
    where: { code: "PROD-BUNDLE-01" },
    update: {},
    create: {
      code: "PROD-BUNDLE-01",
      name: "Super Bundling: Bimbel Intensif + All Access Tryout 2026",
      description: "Investasi terlengkap persiapan tes kedinasan. Dapatkan seluruh fitur bimbel live class plus akses tanpa batas ke semua paket tryout.",
      category: "bundling",
      periodText: "2026",
      price: 529000,
      coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
      benefits: {
        create: [
          { benefitText: "Semua Fasilitas Bimbel Intensif Live Zoom", sortOrder: 1 },
          { benefitText: "Akses Penuh Seluruh Paket Tryout SKD CAT BKN", sortOrder: 2 },
          { benefitText: "Prioritas Review Mistake Notebook dari Tutor", sortOrder: 3 },
          { benefitText: "Garansi Update Bank Soal hingga Ujian Berlangsung", sortOrder: 4 },
        ],
      },
    },
  });

  // 3. Create Coupons
  await prisma.coupon.upsert({
    where: { code: "LOLOS2026" },
    update: {},
    create: {
      code: "LOLOS2026",
      discountType: "FIXED",
      discountValue: 20000,
      minSpend: 40000,
      validUntil: new Date("2026-12-31"),
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "DISKON50" },
    update: {},
    create: {
      code: "DISKON50",
      discountType: "PERCENT",
      discountValue: 50,
      maxDiscount: 50000,
      minSpend: 40000,
      validUntil: new Date("2026-12-31"),
      isActive: true,
    },
  });

  console.log("✅ Products & Coupons created");

  // 4. Create Bimbel Class & Schedules
  const bimbelClass = await prisma.bimbelClass.create({
    data: {
      productId: bimbelProduct.id,
      title: "Kelas Master SKD BKN Kedinasan 2026 (Angkatan 1)",
      description: "Bedah tuntas materi TWK Penalaran, Trik Cepat Hitung TIU 20 Detik, dan Strategi Memilih Opsi Nilai 5 TKP.",
      tutorName: "Dr. Pratama Putra, M.Pd",
      tutorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      schedules: {
        create: [
          {
            topic: "Bedah TWK Penalaran: Nasionalisme & Integritas Sesuai Kisi-kisi BKN",
            startTime: new Date("2026-11-01T19:30:00+07:00"),
            endTime: new Date("2026-11-01T21:00:00+07:00"),
            meetingUrl: "https://zoom.us/j/9876543210?pwd=bimbelmaster2026",
          },
          {
            topic: "Trik Cepat TIU: Silogisme & Analisis Posisi Tanpa Menghafal Rumus",
            startTime: new Date("2026-11-03T19:30:00+07:00"),
            endTime: new Date("2026-11-03T21:00:00+07:00"),
            meetingUrl: "https://zoom.us/j/9876543210?pwd=bimbelmaster2026",
          },
          {
            topic: "Mastery TIU Kuantitatif: Aljabar Praktis, Perbandingan, dan Deret Tingkat Tinggi",
            startTime: new Date("2026-11-05T19:30:00+07:00"),
            endTime: new Date("2026-11-05T21:00:00+07:00"),
            meetingUrl: "https://zoom.us/j/9876543210?pwd=bimbelmaster2026",
          },
          {
            topic: "Bedah TKP Anti-Radikalisme, Profesionalisme & Jejaring Kerja (Target 200+)",
            startTime: new Date("2026-11-08T19:30:00+07:00"),
            endTime: new Date("2026-11-08T21:00:00+07:00"),
            meetingUrl: "https://zoom.us/j/9876543210?pwd=bimbelmaster2026",
          },
        ],
      },
      recordings: {
        create: [
          {
            title: "Rekaman Orientasi & Strategi Manajemen Waktu 100 Menit 110 Soal",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            durationText: "1 Jam 15 Menit",
            sortOrder: 1,
          },
          {
            title: "Rekaman Pembahasan 50 Soal HOTS TWK Penalaran",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            durationText: "1 Jam 30 Menit",
            sortOrder: 2,
          },
        ],
      },
      assignments: {
        create: [
          {
            title: "Tugas Mandiri 01: Analisis 20 Kasus Dilema Integritas & Bela Negara",
            instruction: "Kerjakan lembar kerja terlampir dan upload rangkuman dalam format PDF maksimal ukuran 5MB.",
            deadline: new Date("2026-11-10T23:59:00+07:00"),
          },
        ],
      },
    },
  });

  console.log("✅ Bimbel Class, Schedules, Recordings, and Assignments created");

  // 5. Create Tryout Package
  const tryoutPackage = await prisma.tryoutPackage.create({
    data: {
      productId: tryoutProduct.id,
      title: "SIMULASI CAT BKN SKD KEDINASAN & CPNS 2026 - PAKET PREDIKSI 01",
      description: "Simulasi akurat dengan komposisi 30 Soal TWK, 35 Soal TIU, dan 45 Soal TKP. Durasi 100 menit berstandar BKN resmi.",
      durationMinutes: 100,
      totalQuestions: 110,
      passingGradeTwk: 65,
      passingGradeTiu: 80,
      passingGradeTkp: 166,
      isPublished: true,
    },
  });

  // 6. Generate 110 Authentic SKD Questions
  console.log("📝 Generating 110 authentic SKD questions...");

  const twkTopics = [
    "Nasionalisme", "Integritas", "Bela Negara", "Pilar Negara", "Bahasa Indonesia"
  ];
  const tiuTopics = [
    "Kemampuan Verbal: Analogi", "Kemampuan Verbal: Silogisme", "Kemampuan Verbal: Analitis",
    "Kemampuan Numerik: Berhitung", "Kemampuan Numerik: Deret Angka", "Kemampuan Numerik: Soal Cerita", "Kemampuan Figural"
  ];
  const tkpTopics = [
    "Pelayanan Publik", "Jejaring Kerja", "Sosial Budaya", "TIK", "Profesionalisme", "Anti Radikalisme"
  ];

  // Specific question bank builder
  for (let i = 1; i <= 110; i++) {
    let subtest = "TWK";
    let topic = "";
    let questionText = "";
    let discussionText = "";
    let options = [];

    if (i <= 30) {
      // TWK 1 - 30
      subtest = "TWK";
      topic = twkTopics[(i - 1) % twkTopics.length];
      if (topic === "Nasionalisme") {
        questionText = `Dalam konteks era globalisasi saat ini, penguatan semangat nasionalisme di kalangan generasi muda tidak lagi semata-mata diwujudkan melalui perlawanan fisik, melainkan melalui ketahanan ideologi dan daya saing bangsa. Fenomena maraknya apresiasi berlebihan terhadap produk budaya asing yang mengikis kecintaan terhadap seni lokal mencerminkan ancaman terhadap...? (Nomor Soal: ${i})`;
        discussionText = `Jawaban yang benar menekankan pada aspek ketahanan jati diri budaya bangsa sebagai wujud nasionalisme. Mengapresiasi karya lokal memperkuat integritas identitas nasional di kancah internasional.`;
      } else if (topic === "Integritas") {
        questionText = `Seorang pejabat pengadaan barang dan jasa menerima tawaran 'tanda terima kasih' berupa paket liburan keluarga dari pemenang tender setelah seluruh proses selesai tanpa rekayasa. Berdasarkan prinsip integritas ASN dan pencegahan gratifikasi, sikap yang tepat adalah...? (Nomor Soal: ${i})`;
        discussionText = `Sesuai UU Pemberantasan Tindak Pidana Korupsi dan kode etik ASN, pemberian apapun yang berhubungan dengan jabatan dan berlawanan dengan kewajiban dianggap gratifikasi dan wajib ditolak atau dilaporkan ke KPK dalam waktu 30 hari kerja.`;
      } else if (topic === "Bela Negara") {
        questionText = `Nilai dasar bela negara salah satunya adalah 'Rela berkorban untuk bangsa dan negara'. Bentuk implementasi konkret nilai tersebut bagi seorang mahasiswa atau calon taruna kedinasan dalam kehidupan sehari-hari adalah...? (Nomor Soal: ${i})`;
        discussionText = `Rela berkorban diwujudkan dengan kesediaan menyumbangkan waktu, tenaga, dan pikiran untuk kemajuan masyarakat serta mendahulukan kepentingan bersama di atas kepentingan pribadi.`;
      } else if (topic === "Pilar Negara") {
        questionText = `Kedudukan Pancasila sebagai 'Grundnorm' atau norma dasar tertinggi dalam hierarki peraturan perundang-undangan di Indonesia memiliki konsekuensi hukum bahwa...? (Nomor Soal: ${i})`;
        discussionText = `Sebagai norma dasar (Staatsfundamentalnorm), seluruh undang-undang dan peraturan pelaksana di bawahnya tidak boleh bertentangan dengan nilai-nilai Pancasila.`;
      } else {
        questionText = `Cermati kalimat berikut: "Pemerintah berupaya menanggulangi dampak inflasi dengan cara mengalokasikan anggaran stimulus ke sektor riil." Kalimat yang memiliki pola gramatikal yang sepadan dan ejaan baku adalah...? (Nomor Soal: ${i})`;
        discussionText = `Kalimat efektif memerlukan kesepadanan struktur (Subjek + Predikat + Objek + Keterangan cara) serta penulisan kata baku yang tepat sesuai PUEBI/EYD Edisi V.`;
      }

      options = [
        { optionLabel: "A", optionText: `Mempertahankan nilai luhur serta mengutamakan kepentingan nasional di atas kepentingan kelompok.`, score: 5, isCorrect: true },
        { optionLabel: "B", optionText: `Menutup diri sepenuhnya dari pergaulan dan kerja sama antarnegara asing.`, score: 0, isCorrect: false },
        { optionLabel: "C", optionText: `Menyerahkan sepenuhnya penyelesaian masalah kepada aparat penegak hukum tanpa partisipasi aktif warga.`, score: 0, isCorrect: false },
        { optionLabel: "D", optionText: `Menolak seluruh modernisasi teknologi yang berasal dari luar negeri demi tradisi kuno.`, score: 0, isCorrect: false },
        { optionLabel: "E", optionText: `Menuntut hak istimewa bagi kelompok mayoritas dalam perumusan kebijakan publik nasional.`, score: 0, isCorrect: false },
      ];
    } else if (i <= 65) {
      // TIU 31 - 65
      subtest = "TIU";
      topic = tiuTopics[(i - 31) % tiuTopics.length];
      
      if (topic.includes("Analogi")) {
        questionText = `PILIH HUBUNGAN KATA YANG ANALOGIS:\n\nTELESKOP : ASTRONOM = ... : ... (Nomor Soal: ${i})`;
        discussionText = `Teleskop adalah alat utama yang digunakan oleh seorang astronom untuk bekerja. Hubungan yang sepadan adalah Stetoskop yang digunakan oleh Dokter.`;
        options = [
          { optionLabel: "A", optionText: `STETOSKOP : DOKTER`, score: 5, isCorrect: true },
          { optionLabel: "B", optionText: `PENA : BUKU`, score: 0, isCorrect: false },
          { optionLabel: "C", optionText: `KAMERA : FOTO`, score: 0, isCorrect: false },
          { optionLabel: "D", optionText: `MIKROSKOP : LABORATORIUM`, score: 0, isCorrect: false },
          { optionLabel: "E", optionText: `PALU : MEJA`, score: 0, isCorrect: false },
        ];
      } else if (topic.includes("Silogisme")) {
        questionText = `Premis 1: Semua taruna kedinasan memiliki disiplin waktu yang prima.\nPremis 2: Sebagian orang yang disiplin waktu prima gemar berolahraga pagi.\n\nKesimpulan logis yang sah adalah...? (Nomor Soal: ${i})`;
        discussionText = `Dari premis Semua A adalah B, dan Sebagian B adalah C, kesimpulannya adalah sebagian A adalah C atau ada sebagian orang yang disiplin prima yang merupakan taruna dan gemar berolahraga.`;
        options = [
          { optionLabel: "A", optionText: `Sebagian taruna kedinasan gemar berolahraga pagi.`, score: 5, isCorrect: true },
          { optionLabel: "B", optionText: `Semua yang gemar berolahraga pagi adalah taruna kedinasan.`, score: 0, isCorrect: false },
          { optionLabel: "C", optionText: `Orang yang tidak gemar olahraga pasti bukan taruna kedinasan.`, score: 0, isCorrect: false },
          { optionLabel: "D", optionText: `Semua taruna kedinasan gemar berolahraga pagi.`, score: 0, isCorrect: false },
          { optionLabel: "E", optionText: `Tidak dapat ditarik kesimpulan apapun.`, score: 0, isCorrect: false },
        ];
      } else if (topic.includes("Deret")) {
        const base = (i * 3) % 20 + 2;
        questionText = `Tentukan suku berikutnya dari barisan angka berikut:\n\n${base}, ${base + 4}, ${base + 12}, ${base + 28}, ${base + 60}, ...? (Nomor Soal: ${i})`;
        const nextVal = base + 124;
        discussionText = `Pola selisih antar suku adalah perkalian dua (+4, +8, +16, +32, +64). Maka suku berikutnya adalah ${base + 60} + 64 = ${nextVal}.`;
        options = [
          { optionLabel: "A", optionText: `${nextVal}`, score: 5, isCorrect: true },
          { optionLabel: "B", optionText: `${nextVal - 8}`, score: 0, isCorrect: false },
          { optionLabel: "C", optionText: `${nextVal + 12}`, score: 0, isCorrect: false },
          { optionLabel: "D", optionText: `${nextVal + 24}`, score: 0, isCorrect: false },
          { optionLabel: "E", optionText: `${nextVal - 16}`, score: 0, isCorrect: false },
        ];
      } else {
        // Numerik / Soal Cerita
        questionText = `Sebuah proyek renovasi gedung kantor direncanakan selesai dalam waktu 40 hari oleh 15 pekerja. Setelah dikerjakan selama 10 hari, pekerjaan terhenti selama 6 hari karena kendala logistik. Agar proyek selesai tepat waktu sesuai jadwal semula, berapa tambahan pekerja yang dibutuhkan? (Nomor Soal: ${i})`;
        discussionText = `Sisa waktu awal = 30 hari dengan 15 pekerja -> Beban sisa = 30 x 15 = 450 hari-pekerja. Waktu tersisa setelah libur 6 hari = 24 hari. Jumlah pekerja yang dibutuhkan = 450 / 24 = 18,75 -> dibulatkan 19 pekerja. Tambahan = 19 - 15 = 4 pekerja.`;
        options = [
          { optionLabel: "A", optionText: `4 orang pekerja`, score: 5, isCorrect: true },
          { optionLabel: "B", optionText: `3 orang pekerja`, score: 0, isCorrect: false },
          { optionLabel: "C", optionText: `5 orang pekerja`, score: 0, isCorrect: false },
          { optionLabel: "D", optionText: `6 orang pekerja`, score: 0, isCorrect: false },
          { optionLabel: "E", optionText: `2 orang pekerja`, score: 0, isCorrect: false },
        ];
      }
    } else {
      // TKP 66 - 110 (Nilai 1 sampai 5)
      subtest = "TKP";
      topic = tkpTopics[(i - 66) % tkpTopics.length];

      questionText = `Anda adalah seorang staf pelayanan publik di instansi pemerintah. Pada saat jam istirahat kantor baru saja dimulai, seorang kakek lansia yang datang dari desa terpencil dengan kondisi letih tiba di loket Anda dan memohon pelayanan segera karena jadwal angkutan umum kepulangannya sangat terbatas. Sikap Anda adalah...? (Nomor Soal: ${i} - ${topic})`;
      discussionText = `Aspek ${topic}: Pelayanan prima mengharuskan ASN memiliki empati tinggi dan fleksibilitas solusi tanpa melanggar regulasi dasar. Melayani pemohon lansia terlebih dahulu sebelum beristirahat mencerminkan skor integritas & pelayanan publik maksimal (5 poin).`;

      options = [
        {
          optionLabel: "A",
          optionText: `Dengan tulus menunda waktu istirahat sejenak untuk melayani dan menyelesaikan keperluan kakek tersebut sampai tuntas.`,
          score: 5,
          isCorrect: true,
        },
        {
          optionLabel: "B",
          optionText: `Meminta rekan staf lain yang belum istirahat untuk segera membantu kakek tersebut agar saya tetap bisa istirahat tepat waktu.`,
          score: 4,
          isCorrect: false,
        },
        {
          optionLabel: "C",
          optionText: `Memberikan air minum dan mempersilakan kakek menunggu di ruang tunggu ber-AC hingga jam istirahat berakhir tepat waktu.`,
          score: 3,
          isCorrect: false,
        },
        {
          optionLabel: "D",
          optionText: `Menjelaskan secara sopan bahwa aturan loket istirahat harus dipatuhi oleh semua pihak tanpa pengecualian.`,
          score: 2,
          isCorrect: false,
        },
        {
          optionLabel: "E",
          optionText: `Mengabaikan kehadiran kakek tersebut dan langsung meninggalkan loket karena jam kerja sudah selesai.`,
          score: 1,
          isCorrect: false,
        },
      ];
    }

    const question = await prisma.questionBank.create({
      data: {
        subtest,
        topic,
        questionText,
        discussionText,
        options: {
          create: options,
        },
      },
    });

    await prisma.tryoutQuestion.create({
      data: {
        tryoutId: tryoutPackage.id,
        questionId: question.id,
        questionNumber: i,
      },
    });
  }

  console.log("✅ 110 Questions created and linked to Tryout Package");

  // 7. Create Spotlight Banners
  await prisma.spotlightBanner.createMany({
    data: [
      {
        title: "Pendaftaran Tryout Akbar Nasional 2026 Dibuka!",
        subtitle: "Uji kemampuan CAT BKN Anda bersama 10.000+ calon taruna se-Indonesia",
        imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80",
        linkUrl: "/paket",
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "Bimbel Intensif PKN STAN & Kedinasan",
        subtitle: "Garansi pendampingan belajar sampai hari H tes SKD",
        imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
        linkUrl: "/bimbel",
        sortOrder: 2,
        isActive: true,
      },
    ],
  });

  // 8. Create App Settings
  await prisma.appSetting.createMany({
    data: [
      { key: "SITE_NAME", value: "LolosKampus - Bimbel Kedinasan & CPNS" },
      { key: "PASSING_GRADE_TWK", value: "65" },
      { key: "PASSING_GRADE_TIU", value: "80" },
      { key: "PASSING_GRADE_TKP", value: "166" },
      { key: "CONTACT_WHATSAPP", value: "+6281234567890" },
    ],
  });

  console.log("🎉 All Seed Data Successfully Inserted!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

