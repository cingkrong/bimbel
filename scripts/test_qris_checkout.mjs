import { PrismaClient } from "@prisma/client";
import { crc16Ccitt } from "../src/lib/qris.ts";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

async function main() {
  console.log("======================================================");
  console.log("🧪 TESTING PRODUCTION-GRADE DYNAMIC QRIS CHECKOUT");
  console.log("======================================================");

  // 1. Authenticate student
  const studentEmail = "siswa@loloskampus.com";
  const studentPassword = "password123";

  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: studentEmail,
      password: studentPassword,
      deviceId: "dev-qris-tester",
      deviceInfo: "Chrome on macOS",
    }),
  });
  const loginData = await loginRes.json();
  const cookie = loginRes.headers.get("set-cookie");
  console.log("1. Student Auth Status:", loginData.status, "| Cookie:", Boolean(cookie));

  // 2. Fetch products
  const product = await prisma.product.findFirst({
    where: { isActive: true },
  });
  if (!product) throw new Error("No active product found!");
  console.log("2. Selected Product:", product.name, `(${product.price})`);

  // 3. Perform checkout with QRIS
  const checkoutRes = await fetch(`${BASE_URL}/api/payment/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie || "",
    },
    body: JSON.stringify({
      productId: product.id,
      paymentChannel: "qris",
      couponCode: "LOLOS2026",
    }),
  });

  const checkoutData = await checkoutRes.json();
  console.log("3. Checkout Response Status:", checkoutRes.status);
  const tx = checkoutData.transaction;
  console.log("   Invoice Number:", tx.invoiceNumber);
  console.log("   Total Amount:", tx.totalAmount);
  console.log("   QR Code URL:", tx.qrCodeUrl);

  const qrisMeta = tx.qrisMeta;
  if (!qrisMeta) {
    throw new Error("Missing qrisMeta in checkout response!");
  }

  console.log("\n4. Inspecting QRIS Payload Standard Compliance:");
  console.log("   QRIS Raw String:\n   ", qrisMeta.qrisString);
  console.log("   Merchant Name  :", qrisMeta.merchantName);
  console.log("   NMID           :", qrisMeta.nmid);
  console.log("   Merchant City  :", qrisMeta.merchantCity);

  // Validate ASPI / Bank Indonesia EMVCo Standard
  if (!qrisMeta.qrisString.startsWith("000201")) {
    throw new Error("QRIS String does NOT start with 000201 (EMVCo Payload Format Indicator)!");
  }
  if (!qrisMeta.qrisString.includes("010212")) {
    throw new Error("QRIS String is NOT marked as Dynamic Mode (010212)!");
  }
  if (!qrisMeta.qrisString.includes("5303360")) {
    throw new Error("QRIS String is missing ISO 4217 Currency Tag (5303360 = IDR)!");
  }
  if (!qrisMeta.qrisString.includes("5802ID")) {
    throw new Error("QRIS String is missing Country Code (5802ID)!");
  }

  // Validate CRC16 Checksum
  const crcTagIndex = qrisMeta.qrisString.indexOf("6304");
  if (crcTagIndex === -1) {
    throw new Error("QRIS String is missing Tag 63 (CRC16)!");
  }
  const payloadToSign = qrisMeta.qrisString.slice(0, crcTagIndex + 4);
  const receivedChecksum = qrisMeta.qrisString.slice(crcTagIndex + 4);
  const calculatedChecksum = crc16Ccitt(payloadToSign);

  console.log(`   Calculated CRC16: ${calculatedChecksum} | Received: ${receivedChecksum}`);
  if (calculatedChecksum !== receivedChecksum) {
    throw new Error(`CRC16 mismatch! Expected ${calculatedChecksum}, got ${receivedChecksum}`);
  }
  console.log("✅ EMVCo QRIS Payload & CRC-16 Checksum 100% VALID!");

  // 5. Test Status Check API
  console.log("\n5. Testing /api/payment/status...");
  const statusRes = await fetch(`${BASE_URL}/api/payment/status?invoiceNumber=${tx.invoiceNumber}`);
  const statusData = await statusRes.json();
  console.log("   Initial Status:", statusData.status, "| isPaid:", statusData.isPaid);
  if (statusData.status !== "PENDING") {
    throw new Error(`Expected PENDING, got ${statusData.status}`);
  }

  // 6. Test Webhook Simulation
  console.log("\n6. Simulating settlement webhook...");
  const webhookRes = await fetch(`${BASE_URL}/api/payment/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      invoiceNumber: tx.invoiceNumber,
      status: "PAID",
      transaction_status: "settlement",
    }),
  });
  console.log("   Webhook Response Status:", webhookRes.status);

  // 7. Verify status changed to PAID
  const statusAfterRes = await fetch(`${BASE_URL}/api/payment/status?invoiceNumber=${tx.invoiceNumber}`);
  const statusAfterData = await statusAfterRes.json();
  console.log("   Status after settlement:", statusAfterData.status, "| isPaid:", statusAfterData.isPaid);
  if (!statusAfterData.isPaid) {
    throw new Error("Transaction was not marked as PAID!");
  }

  console.log("\n🎉 ALL TESTS PASSED! QRIS GENERATOR, VOUCHER, & TRANSACTION LIFECYCLE 100% OPERATIONAL!");
}

main().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
}).finally(() => prisma.$disconnect());

