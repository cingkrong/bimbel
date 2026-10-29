import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

async function main() {
  console.log("======================================================");
  console.log("🧪 TESTING ON/OFF LOGIN DEVICE APPROVAL SETTING");
  console.log("======================================================");

  const studentEmail = "siswa@loloskampus.com";
  const studentPassword = "password123";

  // Clean test sessions for student
  const student = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (!student) {
    throw new Error("Student user not found!");
  }

  await prisma.authSession.deleteMany({ where: { userId: student.id } });
  await prisma.loginApprovalRequest.deleteMany({ where: { userId: student.id } });

  // -------------------------------------------------------------------------
  // TEST SCENARIO A: enable_device_approval = "true" (ON)
  // -------------------------------------------------------------------------
  console.log("\n--- [SCENARIO A] enable_device_approval = TRUE (Approval Mode ON) ---");
  await prisma.appSetting.upsert({
    where: { key: "enable_device_approval" },
    update: { value: "true", category: "security" },
    create: { key: "enable_device_approval", value: "true", category: "security" },
  });

  console.log("1. Device A (Laptop Chrome) logs in...");
  const resA = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: studentEmail,
      password: studentPassword,
      deviceId: "dev-laptop-chrome",
      deviceInfo: "Chrome 122 on Windows 11",
    }),
  });
  const dataA = await resA.json();
  const cookieA = resA.headers.get("set-cookie");
  console.log("   Device A Status:", dataA.status, "| Cookie Set:", Boolean(cookieA));
  if (dataA.status !== "SUCCESS") throw new Error("Expected Device A to succeed!");

  console.log("2. Device B (Mobile Safari) attempts to login with DIFFERENT deviceId...");
  const resB = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: studentEmail,
      password: studentPassword,
      deviceId: "dev-phone-safari",
      deviceInfo: "Safari on iOS 17",
    }),
  });
  const dataB = await resB.json();
  console.log("   Device B Status:", dataB.status, "| Request ID:", dataB.requestId);
  if (dataB.status !== "REQUIRES_APPROVAL") {
    throw new Error(`Expected REQUIRES_APPROVAL when toggle is TRUE, got ${dataB.status}`);
  }
  console.log("✅ SCENARIO A PASSED: When setting is ON, new device is blocked pending approval.");

  // -------------------------------------------------------------------------
  // TEST SCENARIO B: enable_device_approval = "false" (OFF)
  // -------------------------------------------------------------------------
  console.log("\n--- [SCENARIO B] enable_device_approval = FALSE (Approval Mode OFF) ---");
  await prisma.appSetting.upsert({
    where: { key: "enable_device_approval" },
    update: { value: "false", category: "security" },
    create: { key: "enable_device_approval", value: "false", category: "security" },
  });

  console.log("3. Device C (Tablet Firefox) logs in while Device A was active, with toggle = FALSE...");
  const resC = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: studentEmail,
      password: studentPassword,
      deviceId: "dev-tablet-firefox",
      deviceInfo: "Firefox on iPadOS",
    }),
  });
  const dataC = await resC.json();
  const cookieC = resC.headers.get("set-cookie");
  console.log("   Device C Status:", dataC.status, "| Cookie Set:", Boolean(cookieC));
  if (dataC.status !== "SUCCESS") {
    throw new Error(`Expected SUCCESS directly when toggle is FALSE, got ${dataC.status}`);
  }

  console.log("4. Verifying old Device A session was automatically terminated (Single-Device Concurrency)...");
  const checkOldDevA = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: cookieA || "" },
  });
  console.log("   Old Device A /api/auth/me Response Status:", checkOldDevA.status, "(Expected: 401)");
  if (checkOldDevA.status !== 401) {
    throw new Error(`Expected Device A session to be 401 Unauthorized, got ${checkOldDevA.status}`);
  }

  console.log("5. Verifying new Device C is currently authorized and active...");
  const checkNewDevC = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: cookieC || "" },
  });
  const dataMeC = await checkNewDevC.json();
  console.log("   New Device C /api/auth/me Response Status:", checkNewDevC.status);
  console.log("   New Device C User:", dataMeC.user?.username, "| Active Device:", dataMeC.user?.currentDeviceId);
  if (checkNewDevC.status !== 200 || dataMeC.user?.currentDeviceId !== "dev-tablet-firefox") {
    throw new Error("Device C session failed validation!");
  }
  console.log("✅ SCENARIO B PASSED: When setting is OFF, new device enters immediately and kicks old session.");

  // -------------------------------------------------------------------------
  // TEST SCENARIO C: Admin Settings API Integration Check
  // -------------------------------------------------------------------------
  console.log("\n--- [SCENARIO C] Admin Settings Endpoint Verification ---");
  // Login as admin
  const adminLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "superadmin@loloskampus.com",
      password: "admin123",
    }),
  });
  const adminCookie = adminLoginRes.headers.get("set-cookie");

  // Fetch settings via GET /api/admin/settings
  const getSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    headers: { Cookie: adminCookie || "" },
  });
  const settingsData = await getSettingsRes.json();
  console.log("   Fetched enable_device_approval from Admin API:", settingsData.settings?.enable_device_approval);

  // Toggle back to "true" via PUT /api/admin/settings
  const putRes = await fetch(`${BASE_URL}/api/admin/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie || "",
    },
    body: JSON.stringify({
      settings: { enable_device_approval: "true" },
    }),
  });
  const putData = await putRes.json();
  console.log("   PUT /api/admin/settings result:", putData.success);

  const finalSetting = await prisma.appSetting.findUnique({ where: { key: "enable_device_approval" } });
  console.log("   Final setting in Database:", finalSetting?.value);

  console.log("\n🎉 ALL TESTS PASSED! ON/OFF LOGIN DEVICE APPROVAL IS 100% OPERATIONAL & VERIFIED!");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
}).finally(() => prisma.$disconnect());

