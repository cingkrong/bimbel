function crc16Ccitt(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  let hex = crc.toString(16).toUpperCase();
  while (hex.length < 4) hex = "0" + hex;
  return hex;
}

function formatTlv(tag, value) {
  const len = String(value.length).padStart(2, "0");
  return `${tag}${len}${value}`;
}

// Universal ASPI / Bank Indonesia pure EMVCo MPM QRIS
function buildAspiStandardQris({
  amount = 10000,
  invoiceNumber = "INV-20261029-001",
  merchantName = "LOLOSKAMPUS BIMBEL CAT",
  city = "JAKARTA",
  postalCode = "10110",
  nmid = "ID1024319802914",
}) {
  let payload = "";
  // 00: Payload Format Indicator
  payload += formatTlv("00", "01");
  // 01: Point of Initiation (12 = Dynamic)
  payload += formatTlv("01", "12");

  // 26: Merchant Account Information (Standard ASPI / Bank Nobu 93600914)
  const acquirerPan = "93600914" + nmid.replace(/\D/g, "").slice(0, 10).padEnd(10, "0");
  const sub26 =
    formatTlv("00", "ID.CO.QRIS.WWW") +
    formatTlv("01", acquirerPan) +
    formatTlv("02", nmid) +
    formatTlv("03", "UME");
  payload += formatTlv("26", sub26);

  // 52: MCC 8299
  payload += formatTlv("52", "8299");

  // 53: Currency IDR 360
  payload += formatTlv("53", "360");

  // 54: Amount
  payload += formatTlv("54", String(Math.round(amount)));

  // 58: Country ID
  payload += formatTlv("58", "ID");

  // 59: Merchant Name (alphanumeric, max 25 chars)
  const cleanName = merchantName.replace(/[^A-Za-z0-9 ]/g, "").slice(0, 25).trim().toUpperCase();
  payload += formatTlv("59", cleanName);

  // 60: Merchant City
  const cleanCity = city.replace(/[^A-Za-z0-9 ]/g, "").slice(0, 15).trim().toUpperCase();
  payload += formatTlv("60", cleanCity);

  // 61: Postal Code
  if (postalCode) {
    payload += formatTlv("61", postalCode.slice(0, 10));
  }

  // 62: Additional Data (Bill Number)
  if (invoiceNumber) {
    const sub62 = formatTlv("01", invoiceNumber) + formatTlv("07", "A01");
    payload += formatTlv("62", sub62);
  }

  // 63: CRC16
  const toSign = payload + "6304";
  const checksum = crc16Ccitt(toSign);
  return toSign + checksum;
}

const qris = buildAspiStandardQris({
  amount: 25000,
  invoiceNumber: "INV-12345678",
  merchantName: "LOLOSKAMPUS BIMBEL",
  city: "JAKARTA",
  nmid: "ID1024319802914",
});

console.log("Pure ASPI QRIS String:\n", qris);

