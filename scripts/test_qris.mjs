function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= (str.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
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

export function generateQrisString({
  nmid = "ID10200384910234",
  merchantName = "LOLOSKAMPUS EDTECH",
  city = "JAKARTA",
  postalCode = "10110",
  amount,
  invoiceNumber,
}) {
  // Tag 00: Payload Format Indicator
  let payload = formatTlv("00", "01");
  // Tag 01: Point of Initiation Method: 12 = Dynamic (amount specific)
  payload += formatTlv("01", amount ? "12" : "11");

  // Tag 26: Merchant Account Information
  const mId = formatTlv("00", "ID.CO.QRIS.WWW") + formatTlv("01", nmid) + formatTlv("02", "081234567890123");
  payload += formatTlv("26", mId);

  // Tag 51: Additional Merchant Info (BionPay / National Aggregator)
  const bionId = formatTlv("00", "ID.CO.BION.WWW") + formatTlv("01", "BION09812490182") + formatTlv("02", "A01");
  payload += formatTlv("51", bionId);

  // Tag 52: MCC (Merchant Category Code) 8299 = Educational Services
  payload += formatTlv("52", "8299");

  // Tag 53: Currency (360 = IDR)
  payload += formatTlv("53", "360");

  // Tag 54: Amount (if dynamic)
  if (amount) {
    payload += formatTlv("54", String(Math.round(amount)));
  }

  // Tag 58: Country Code
  payload += formatTlv("58", "ID");

  // Tag 59: Merchant Name (sanitized, max 25 chars)
  const cleanName = merchantName.slice(0, 25).toUpperCase();
  payload += formatTlv("59", cleanName);

  // Tag 60: City
  payload += formatTlv("60", city.slice(0, 15).toUpperCase());

  // Tag 61: Postal Code
  if (postalCode) {
    payload += formatTlv("61", postalCode.slice(0, 10));
  }

  // Tag 62: Additional Data (Invoice number / Bill number)
  if (invoiceNumber) {
    const addData = formatTlv("01", invoiceNumber) + formatTlv("07", "A01");
    payload += formatTlv("62", addData);
  }

  // Tag 63: CRC16
  const toCheck = payload + "6304";
  const checksum = crc16(toCheck);
  return toCheck + checksum;
}

const testQris = generateQrisString({
  amount: 99000,
  invoiceNumber: "INV-20261029-001",
});

console.log("Generated QRIS String:\n", testQris);
console.log("Length:", testQris.length);

