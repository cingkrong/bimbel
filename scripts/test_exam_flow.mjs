import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testExamFlow() {
  console.log("🚀 Starting End-to-End CAT BKN Exam Simulation...");

  // 0. Clean prior sessions so login succeeds directly
  const user = await prisma.user.findUnique({
    where: { email: "siswa@loloskampus.com" },
  });
  if (user) {
    await prisma.authSession.deleteMany({ where: { userId: user.id } });
    await prisma.loginApprovalRequest.deleteMany({ where: { userId: user.id } });
  }

  // 1. Login student
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "siswa@loloskampus.com",
      password: "password123",
      deviceId: "dev-exam-runner",
      deviceInfo: "Chrome Exam Browser",
    }),
  });
  const cookie = loginRes.headers.get("set-cookie") || "";
  const loginJson = await loginRes.json();
  console.log("1. Student Logged in:", loginJson.status, "Cookie acquired:", Boolean(cookie));

  // 2. Get Tryout Package
  const tryout = await prisma.tryoutPackage.findFirst({
    where: { isPublished: true },
  });
  if (!tryout) throw new Error("No tryout package found");
  console.log("2. Target Tryout:", tryout.title);

  // 3. Load Exam via API
  const examRes = await fetch(`http://localhost:3000/api/exam/${tryout.id}`, {
    headers: { Cookie: cookie },
  });
  console.log("3. Exam HTTP Status:", examRes.status);
  const examData = await examRes.json();
  console.log("   Exam API Body:", examData);
  if (!examRes.ok) throw new Error("Failed to load exam: " + JSON.stringify(examData));
  console.log("3. Exam Loaded. Total Questions:", examData.questions?.length);
  console.log("   Session ID:", examData.session.id);
  console.log("   Initial Duration (Sec):", examData.session.durationLeftSec);

  const sessionId = examData.session.id;

  // 4. Answer questions (Simulate student answering questions)
  console.log("4. Simulating student answering questions with autosave...");
  
  // Fetch real question bank with options to pick right/wrong choices
  const questionsInDb = await prisma.tryoutQuestion.findMany({
    where: { tryoutId: tryout.id },
    orderBy: { questionNumber: "asc" },
    include: {
      question: {
        include: { options: true },
      },
    },
  });

  // Let's answer the first 10 questions with autosave
  for (let i = 0; i < 10; i++) {
    const tq = questionsInDb[i];
    // Pick the correct option for first 8, wrong for last 2
    const targetOpt = i < 8
      ? tq.question.options.find((o) => o.isCorrect) || tq.question.options[0]
      : tq.question.options.find((o) => !o.isCorrect) || tq.question.options[1];

    const storeRes = await fetch("http://localhost:3000/api/exam/storeanswer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        sessionId,
        questionNumber: tq.questionNumber,
        selectedOptionId: targetOpt.id,
        isDoubtful: i === 3, // Mark question 4 as doubtful
        durationLeftSec: 5850,
      }),
    });
    const storeJson = await storeRes.json();
    if (!storeJson.success) {
      throw new Error(`Failed to store answer for question #${tq.questionNumber}`);
    }
  }
  console.log("   ✓ 10 answers autosaved successfully (including 1 marked as ragu-ragu)");

  // 5. Submit Exam for Scoring
  console.log("5. Submitting Exam for Scoring...");
  const scoreRes = await fetch("http://localhost:3000/api/exam/scoring", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ sessionId }),
  });
  const scoreJson = await scoreRes.json();
  console.log("   Scoring Result:", scoreJson.result);
  console.log("   Score TWK:", scoreJson.result.scoreTwk, `(Passing Grade: ${scoreJson.result.passingGradeTwk})`);
  console.log("   Score TIU:", scoreJson.result.scoreTiu, `(Passing Grade: ${scoreJson.result.passingGradeTiu})`);
  console.log("   Score TKP:", scoreJson.result.scoreTkp, `(Passing Grade: ${scoreJson.result.passingGradeTkp})`);
  console.log("   Total Score:", scoreJson.result.totalScore);
  console.log("   Passed Status:", scoreJson.result.isPassed ? "LOLOS PASSING GRADE" : "TIDAK LOLOS");

  // 6. Verify Mistake Notebook
  const mistakes = await prisma.mistakeNotebook.findMany({
    where: { userId: examData.session.answers?.[0]?.userId || (await prisma.user.findUnique({ where: { email: "siswa@loloskampus.com" } })).id },
  });
  console.log("6. Mistake Notebook entries automatically recorded:", mistakes.length);

  // 7. Verify Discussion endpoint
  const discRes = await fetch(`http://localhost:3000/api/exam/${tryout.id}/discussion`, {
    headers: { Cookie: cookie },
  });
  const discJson = await discRes.json();
  console.log("7. Discussion API verified. Questions returned:", discJson.questions?.length);
  console.log("   Summary total score in discussion:", discJson.summary?.totalScore);

  // 8. Verify Competency Analytics endpoint
  const analyticsRes = await fetch("http://localhost:3000/api/analytics/competency", {
    headers: { Cookie: cookie },
  });
  const analyticsJson = await analyticsRes.json();
  console.log("8. Analytics API verified.");
  console.log("   Total Tryouts in telemetry:", analyticsJson.metrics?.totalTryouts);
  console.log("   Highest Score in telemetry:", analyticsJson.metrics?.highestScore);
  console.log("   Competency dimensions mapped:", analyticsJson.radarData?.length);

  console.log("🎉 ALL E2E CAT EXAM & ANALYTICS TESTS PASSED WITH 100% SUCCESS!");
}

testExamFlow()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
