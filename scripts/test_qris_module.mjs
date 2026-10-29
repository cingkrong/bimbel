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

function generateDynamicQris({ amount, invoiceNumber, merchantName = "LOLOSKAMPUS EDTECH", nmid = "ID1024319802914" }) {
  let payload = formatTlv("00", "01");
  payload += formatTlv("01", "12");
  const sub26 =
    formatTlv("00", "ID.CO.QRIS.WWW") +
    formatTlv("01", nmid) +
    formatTlv("02", "081234567890123") +
    formatTlv("03", "UME");
  payload += formatTlv("26", sub26);

  const sub51 =
    formatTlv("00", "ID.CO.BION.WWW") +
    formatTlv("01", "BION99812490182") +
    formatTlv("02", "A01");
  payload += formatTlv("51", sub51);

  payload += formatTlv("52", "8299");
  payload += formatTlv("53", "360");
  payload += formatTlv("54", Math.round(amount).toString());
  payload += formatTlv("58", "ID");
  payload += formatTlv("59", merchantName.slice(0, 25).toUpperCase());
  payload += formatTlv("60", "JAKARTA");
  payload += formatTlv("61", "10110");

  const sub62 = formatTlv("01", invoiceNumber) + formatTlv("07", "A01");
  payload += formatTlv("62", sub62);

  const toSign = payload + "6304";
  const checksum = crc16Ccitt(toSign);
  return toSign + checksum;
}

const sample = generateDynamicQris({
  amount: 250500,
  invoiceNumber: "INV-20261029-7890",
  merchantName: "LOLOSKAMPUS BIMBEL",
  nmid: "ID1024319802914",
});

console.log("Valid QRIS String:", sample);
console.log("Starts with 000201:", sample.startsWith("000201"));
console.log("Ends with 6304XXXX:", /6304[0-9A-F]{4}$/.test(sample));

