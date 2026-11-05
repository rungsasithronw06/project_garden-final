// สคริปต์ตรวจปัญหา "สถานที่รอบสวนไม่มีผลลัพธ์" โดยยิง Overpass ตรง ๆ แยกจากเว็บ และวัดเวลาแยกเป็นขั้น
// รัน (จากโฟลเดอร์โปรเจกต์):  node server/scripts/check-places.mjs [lat] [lng] [รัศมีเมตร]
// ตัวอย่างนี้ใช้พิกัดสวนพฤกษศาสตร์สกุโณทยาน
import { buildQuery } from "../src/services/places.js";
import { config } from "../src/config.js";

const [lat = "16.836887", lng = "100.530726", radius = "5000"] = process.argv.slice(2);
const point = { lat: Number(lat), lng: Number(lng) };
const post = (url, query, timeoutMs) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "garden-finder-student-project" },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(timeoutMs)
  });

async function step(label, run) {
  const started = Date.now();
  try {
    const detail = await run();
    console.log(`  ✓ ${label}: ${((Date.now() - started) / 1000).toFixed(1)} วิ ${detail}`);
  } catch (error) {
    console.log(`  ✗ ${label}: ${((Date.now() - started) / 1000).toFixed(1)} วิ  ${error.name}: ${error.message}`);
  }
}

for (const url of config.overpass.urls) {
  console.log(`\n${url}`);
  // 1) status: เบาที่สุด ถ้าขั้นนี้ช้า/ล้ม = เครือข่ายไปเซิร์ฟเวอร์นี้มีปัญหา หรือเซิร์ฟเวอร์ล่ม
  await step("1 status (ping)", async () => {
    const response = await fetch(url.replace("/interpreter", "/status"), { headers: { "User-Agent": "garden-finder-student-project" }, signal: AbortSignal.timeout(15000) });
    return `HTTP ${response.status}`;
  });
  // 2) query จิ๋ว: ถ้าขั้นนี้เร็วแต่ขั้น 3 ช้า = ปัญหาที่ query ของเรา
  await step("2 query จิ๋ว", async () => {
    const response = await post(url, `[out:json][timeout:10];node(${point.lat},${point.lng},${point.lat + 0.001},${point.lng + 0.001});out count;`, 20000);
    return `HTTP ${response.status}`;
  });
  // 3) query จริงของเว็บ
  await step("3 query จริง", async () => {
    const response = await post(url, buildQuery(point, Number(radius)), config.overpass.timeoutMs);
    if (!response.ok) return `HTTP ${response.status}`;
    const data = await response.json();
    return `HTTP 200 พบ ${data.elements?.length ?? "?"} รายการ${data.remark ? ` (remark: ${data.remark})` : ""}`;
  });
}
