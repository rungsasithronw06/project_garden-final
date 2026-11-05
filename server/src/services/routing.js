// [เพิ่มใหม่] เส้นทางถนนจริงจาก OSRM (ข้อมูล OpenStreetMap) แทนการลากเส้นตรง — แก้ข้อแนะนำข้อ 3 ของอาจารย์
// ใช้ "Table API" เรียกครั้งเดียวได้ระยะ+เวลาจากต้นทางไปหลายปลายทาง (ประหยัดกว่าเรียกทีละสวน)
import { config } from "../config.js";
import { TtlCache, stats } from "./cache.js";
import { fetchJsonWithTimeout, roundCoord } from "../utils/http.js";
import { haversine } from "../utils/geo.js";

const cache = new TtlCache();

const keyOf = (origin, destinations) =>
  `${roundCoord(origin.lat)},${roundCoord(origin.lng)}>` + destinations.map((d) => `${roundCoord(d.lat)},${roundCoord(d.lng)}`).join(";");

// OSRM ใช้ลำดับ "lng,lat" (กลับกับที่เราคุ้น)
const toPair = (point) => `${point.lng},${point.lat}`;

async function callOsrm(origin, destinations) {
  const coords = [origin, ...destinations].map(toPair).join(";");
  // sources=0 คือจุดต้นทางจุดเดียว, destinations=1..n คือสวนทั้งหมด
  const destinationIndexes = destinations.map((_, index) => index + 1).join(";");
  const url = `${config.osrm.baseUrl}/table/v1/driving/${coords}?sources=0&destinations=${destinationIndexes}&annotations=distance,duration`;
  stats.upstreamRouting += 1;
  const data = await fetchJsonWithTimeout(url, {}, 10000);
  if (data.code !== "Ok" || !data.distances?.[0] || !data.durations?.[0]) throw new Error("OSRM: ตอบกลับไม่ถูกต้อง");
  return destinations.map((_, index) => {
    const meters = data.distances[0][index];
    const seconds = data.durations[0][index];
    // null = OSRM หาเส้นทางไม่ได้ (เช่น เกาะ/ไม่มีถนนเชื่อม)
    if (meters === null || seconds === null) return null;
    return { distanceKm: Math.round(meters / 100) / 10, durationMin: Math.round(seconds / 60) };
  });
}

// คืน array ขนาดเท่า destinations: { distanceKm, durationMin, source } — source = "osrm" (ถนนจริง) หรือ "estimate" (เส้นตรง)
export async function getRoadRoutes(origin, destinations) {
  if (destinations.length === 0) return [];
  const key = keyOf(origin, destinations);
  const cached = cache.get(key);
  if (cached && cached.fresh) {
    stats.cacheHits += 1;
    return cached.value;
  }
  try {
    const rows = await callOsrm(origin, destinations);
    const result = rows.map((row, index) => row ? { ...row, source: "osrm" } : estimate(origin, destinations[index]));
    cache.set(key, result, config.ttl.route);
    return result;
  } catch (error) {
    console.error("[routing]", error.message);
    // ใช้ผลเก่าก่อน ถ้าไม่มีค่อยถอยไประยะเส้นตรง (บอกชัดว่าเป็นค่าประมาณ)
    if (cached) return cached.value.map((row) => ({ ...row, stale: true }));
    return destinations.map((destination) => estimate(origin, destination));
  }
}

// ระยะเส้นตรง = ค่าต่ำสุดที่เป็นไปได้ ระยะถนนจริงไม่มีทางสั้นกว่านี้
function estimate(origin, destination) {
  const km = haversine(origin.lat, origin.lng, destination.lat, destination.lng);
  return { distanceKm: Math.round(km * 10) / 10, durationMin: null, source: "estimate" };
}
