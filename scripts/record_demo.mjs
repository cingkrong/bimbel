peroimport { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function smoothScroll(page, distance, steps = 10, delay = 50) {
  const step = distance / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, step);
    await sleep(delay);
  }
}

async function runDemoRecording() {
  console.log("🧹 Resetting student state for clean recording walkthrough...");
  const prisma = new PrismaClient();
  try {
    const student = await prisma.user.findUnique({
      where: { email: "siswa@loloskampus.com" },
    });
    if (student) {
      await prisma.authSession.deleteMany({ where: { userId: student.id } });
      await prisma.loginApprovalRequest.deleteMany({ where: { userId: student.id } });
      await prisma.examAnswer.deleteMany({ where: { userId: student.id } });
      await prisma.examSession.deleteMany({ where: { userId: student.id } });
    }
  } catch (err) {
    console.error("Reset error:", err);
  } finally {
    await prisma.$disconnect();
  }

  const outputDir = path.resolve("e:/Project/bimbel/demo_recordings");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("🎬 Starting Playwright browser with video capture...");

  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: false,
    args: ["--start-maximized", "--disable-gpu-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  console.log("📍 SCENE 1: Homepage (Beranda)");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await sleep(1500);

  // Scroll down smoothly through homepage
  console.log("   Scrolling through hero & trust badges...");
  await smoothScroll(page, 500, 15, 60);
  await sleep(1200);

  console.log("   Exploring Tryout Packages showcase...");
  await smoothScroll(page, 600, 15, 60);
  await sleep(1500);

  console.log("   Exploring Analytics feature preview...");
  await smoothScroll(page, 600, 15, 60);
  await sleep(1500);

  // Scroll back to top
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await sleep(1000);

  console.log("📍 SCENE 2: Login Siswa");
  await page.click('a[href="/login"]');
  await page.waitForURL("**/login**");
  await sleep(1500);

  // Demo credentials already typed, click Masuk
  console.log("   Submitting student credentials...");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/tryout**");
  await sleep(2000);

  console.log("📍 SCENE 3: Tryout Catalog");
  await smoothScroll(page, 200, 8, 50);
  await sleep(1500);

  // Click on Tryout to enter Exam Engine
  console.log("   Entering CAT BKN Exam Engine...");
  const startBtn = page.locator('a:has-text("Mulai Simulasi CAT")').first();
  await startBtn.click();
  await page.waitForURL("**/tryout/*");
  await sleep(2500);

  console.log("📍 SCENE 4: Interactive CAT BKN Exam Engine");
  // Select option on Question 1
  await sleep(1000);
  const optionA = page.locator('button:has-text("Mempertahankan nilai luhur")').first();
  if (await optionA.isVisible()) {
    await optionA.click();
  } else {
    await page.locator('.btn-interactive').first().click();
  }
  await sleep(1000);

  // Mark Ragu-ragu
  console.log("   Marking question as ragu-ragu...");
  const raguLabel = page.locator('label:has-text("Ragu-ragu")');
  await raguLabel.click();
  await sleep(1000);

  // Next Question
  console.log("   Navigating to next question...");
  await page.click('button:has-text("Selanjutnya")');
  await sleep(1200);

  // Select Option on Question 2
  await page.locator('button:has-text("Mempertahankan nilai luhur"), button:has-text("Sesuai UU")').first().click().catch(() => { });
  await sleep(1000);

  // Switch Subtest Tab: TIU
  console.log("   Switching subtest tab to TIU (31-65)...");
  await page.click('button:has-text("TIU (31-65)")');
  await sleep(1500);

  // Answer TIU Question
  await page.locator('button:has-text("STETOSKOP : DOKTER"), button:has-text("Sebagian taruna")').first().click().catch(() => { });
  await sleep(1000);

  // Switch Subtest Tab: TKP
  console.log("   Switching subtest tab to TKP (66-110)...");
  await page.click('button:has-text("TKP (66-110)")');
  await sleep(1500);

  // Answer TKP Question
  await page.locator('button:has-text("Dengan tulus menunda")').first().click().catch(() => { });
  await sleep(1200);

  // Click Selesaikan Ujian
  console.log("   Finishing Exam & triggering Scoring Engine...");
  await page.click('button:has-text("Selesaikan Ujian")');
  await sleep(1500);

  // Confirm Finish
  await page.click('button:has-text("Ya, Selesaikan Sekarang")');
  await sleep(3500); // Wait for scoring calculation, modal & confetti

  // Click "Lihat Pembahasan Lengkap"
  console.log("📍 SCENE 5: Pembahasan Lengkap & Kunci Jawaban");
  await page.click('button:has-text("Lihat Pembahasan Lengkap")');
  await page.waitForURL("**/discussion**");
  await sleep(2000);

  // Filter tabs
  console.log("   Filtering discussion by Benar...");
  await page.click('button:has-text("Benar")');
  await sleep(1500);
  await smoothScroll(page, 400, 10, 50);
  await sleep(1500);

  console.log("   Filtering discussion by Salah...");
  await page.click('button:has-text("Salah")');
  await sleep(1500);
  await smoothScroll(page, 400, 10, 50);
  await sleep(1500);

  // Open "Laporkan Soal" modal
  console.log("   Demonstrating Laporkan Soal modal...");
  const flagBtn = page.locator('button[title="Laporkan Soal"]').first();
  if (await flagBtn.isVisible()) {
    await flagBtn.click();
    await sleep(1500);
    await page.click('button:has-text("Batal")');
    await sleep(800);
  }

  console.log("📍 SCENE 6: Raport & Radar Kompetensi");
  await page.click('a[href="/perkembangan-belajar"]');
  await page.waitForURL("**/perkembangan-belajar**");
  await sleep(2500);

  // Scroll down to view Radar Chart and Progression Line
  console.log("   Viewing Radar Chart & Metrics...");
  await smoothScroll(page, 350, 12, 50);
  await sleep(2500);

  // Switch to Mistake Notebook tab
  console.log("   Switching to Mistake Notebook tab...");
  await page.click('button:has-text("Mistake Notebook")');
  await sleep(2000);

  // Mark mistake as reviewed
  console.log("   Toggling mistake reviewed status...");
  const markReviewedBtn = page.locator('button:has-text("Tandai Dikuasai")').first();
  if (await markReviewedBtn.isVisible()) {
    await markReviewedBtn.click();
    await sleep(1500);
  }

  console.log("📍 SCENE 7: Kelas Bimbel LMS");
  await page.click('a[href="/bimbel"]');
  await page.waitForURL("**/bimbel**");
  await sleep(2000);

  // Scroll through live Zoom schedules & recordings
  console.log("   Browsing Zoom schedule & recordings...");
  await smoothScroll(page, 400, 12, 50);
  await sleep(2000);

  console.log("📍 SCENE 8: Paket & Harga and Checkout");
  await page.click('a[href="/paket"]');
  await page.waitForURL("**/paket**");
  await sleep(2000);

  // Scroll pricing cards
  await smoothScroll(page, 300, 10, 50);
  await sleep(1500);

  // Click Checkout on Featured Bundle
  console.log("   Entering Checkout Flow...");
  const checkoutBtn = page.locator('a[href^="/checkout"]').first();
  await checkoutBtn.click();
  await page.waitForURL("**/checkout**");
  await sleep(2000);

  // Apply Coupon LOLOS2026
  console.log("   Redeeming promo voucher LOLOS2026...");
  const couponInput = page.locator('input[placeholder*="LOLOS2026"]');
  await couponInput.fill("LOLOS2026");
  await sleep(500);
  await page.click('button:has-text("Gunakan Kupon")');
  await sleep(1500);

  // Click Bayar Sekarang
  console.log("   Generating QRIS Dynamic Payment...");
  await page.click('button:has-text("Bayar Sekarang")');
  await sleep(2500);

  // Simulate Payment Webhook Success
  console.log("   Simulating payment webhook confirmation...");
  await page.click('button:has-text("Simulasikan Pembayaran Berhasil")');
  await sleep(3000); // Wait for confetti & success animation

  console.log("📍 SCENE 9: Profil Akun & Afiliasi Siswa");
  await page.click('a[href="/akun"]');
  await page.waitForURL("**/akun**");
  await sleep(2000);

  // Copy referral link
  console.log("   Demonstrating affiliate referral copy...");
  await page.click('button:has-text("Salin Tautan Afiliasi")');
  await sleep(1500);

  console.log("🏁 Walkthrough finished! Closing browser and saving video...");
  const rawVideoPath = await page.video().path();
  await context.close();
  await browser.close();

  if (rawVideoPath && fs.existsSync(rawVideoPath)) {
    const finalMp4Path = path.resolve("e:/Project/bimbel/demo_loloskampus_platform.mp4");

    console.log(`📹 Raw video recorded at: ${rawVideoPath}`);
    console.log("🔄 Converting to optimized MP4 with FFmpeg...");

    const ffmpegPath =
      "C:\\Users\\BISMILLAH\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin\\ffmpeg.exe";

    const cmd = `"${ffmpegPath}" -y -i "${rawVideoPath}" -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p "${finalMp4Path}"`;
    execSync(cmd, { stdio: "inherit" });

    console.log(`✨ SUCCESS! Final Demo Video created at: ${finalMp4Path}`);
  }
}

runDemoRecording().catch((err) => {
  console.error("Recording error:", err);
  process.exit(1);
});
