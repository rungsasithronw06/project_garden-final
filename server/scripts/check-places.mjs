// สคริปต์ตรวจปัญหา "สถานที่รอบสวนไม่มีผลลัพธ์" โดยยิง Overpass ตรง ๆ แยกจากเว็บ
// วิธีรัน (จากโฟลเดอร์ server):  node scripts/check-places.mjs 16.38623197 104.32149178 5000
//   อาร์กิวเมนต์: lat lng รัศมี(เมตร, ไม่ใส่ = 5000)  ตัวอย่างนี้คือพิกัดสวนพฤกษศาสตร์ดงมะอี่
import { buildQuery } from "../src/services/places.js";

const [lat = "16.38623197", lng = "104.32149178", radius = "5000"] = process.argv.slice(2);
const point = { lat: Number(lat), lng: Number(lng) };
const servers = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter"
];

for (const url of servers) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "garden-finder-student-project" },
      body: `data=${encodeURIComponent(buildQuery(point, Number(radius)))}`,
      signal: AbortSignal.timeout(30000)
    });
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    if (!response.ok) {
      console.log(`✗ ${url}\n  HTTP ${response.status} (${seconds} วิ) → เซิร์ฟเวอร์ปฏิเสธ/ยุ่ง ไม่ใช่ปัญหาโค้ด`);
      continue;
    }
    const data = await response.json();
    const count = data.elements?.length ?? "ไม่มี field elements";
    console.log(`✓ ${url}\n  HTTP 200 (${seconds} วิ) พบ ${count} รายการในรัศมี ${radius} ม.${data.remark ? `\n  remark: ${data.remark}` : ""}`);
  } catch (error) {
    console.log(`✗ ${url}\n  ${error.name}: ${error.message} → ต่อเน็ต/ถูกบล็อก/หมดเวลา`);
  }
}
