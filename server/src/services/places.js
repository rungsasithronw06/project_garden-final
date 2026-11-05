// [เพิ่มใหม่] สถานที่รอบสวน จาก OpenStreetMap ผ่าน Overpass API (ฟรี ไม่ต้องใช้ key)
// Express ทำหน้าที่: สร้างคำค้น, จัดหมวด, ตัดรายการซ้ำด้วย Hash Map, เรียงตามระยะด้วย Merge Sort, จำกัดจำนวนต่อหมวด
import { config } from "../config.js";
import { HttpError } from "../utils/errors.js";
import { haversine } from "../utils/geo.js";
import { fetchJsonWithTimeout, roundCoord } from "../utils/http.js";
import { mergeSortBy, takeFirst } from "../utils/mergeSort.js";
import { TtlCache, stats } from "./cache.js";

const cache = new TtlCache();

// หมวดที่แสดง: key → ป้ายไทย
export const CATEGORIES = [
  { key: "eat", label: "ร้านอาหาร / คาเฟ่" },
  { key: "stay", label: "ที่พัก" },
  { key: "see", label: "ที่เที่ยวใกล้เคียง" },
  { key: "fuel", label: "ปั๊มน้ำมัน" }
];

// จัดหมวดจาก tag ของ OpenStreetMap (คืน null ถ้าไม่เข้าหมวดไหน)
export function classify(tags) {
  if (["restaurant", "cafe"].includes(tags.amenity)) return "eat";
  if (tags.amenity === "fuel") return "fuel";
  if (["hotel", "guest_house", "resort", "hostel", "camp_site"].includes(tags.tourism)) return "stay";
  if (["attraction", "viewpoint", "museum", "zoo"].includes(tags.tourism)) return "see";
  return null;
}

// [แก้ไข] ใช้ "กรอบสี่เหลี่ยม" (bbox) แทน around: bbox ใช้ดัชนีพิกัดของ Overpass ตรง ๆ เร็วกว่ามาก
// ส่วน around คำนวณระยะวงกลมกับทุกจุด/เส้น/ความสัมพันธ์ จึงหนักและเป็นสาเหตุที่หมดเวลา
// กรอบสี่เหลี่ยมจะกว้างกว่าวงกลมเล็กน้อย → shapePlaces คัดทิ้งรายการที่เกินรัศมีจริงอีกที (Haversine)
export function buildQuery(point, radiusMeters) {
  const dLat = radiusMeters / 111320;
  const dLng = radiusMeters / (111320 * Math.cos((point.lat * Math.PI) / 180));
  const box = [point.lat - dLat, point.lng - dLng, point.lat + dLat, point.lng + dLng].map((n) => n.toFixed(5)).join(",");
  return `[out:json][timeout:25];(nwr["amenity"~"^(restaurant|cafe|fuel)$"]["name"](${box});nwr["tourism"~"^(hotel|guest_house|resort|hostel|camp_site|attraction|viewpoint|museum|zoo)$"]["name"](${box}););out center 300;`;
}

// แปลงผลดิบ → กลุ่มตามหมวด (ฟังก์ชันล้วน ไว้เทสต์)
export function shapePlaces(elements, origin, perCategory, radiusKm = Infinity) {
  // Hash Map: กันรายการซ้ำ (OSM มักมีทั้งจุดและอาคารของที่เดียวกัน) key = หมวด + ชื่อ  → O(1) ต่อรายการ
  const seen = new Map();
  for (const element of elements || []) {
    const tags = element.tags || {};
    const category = classify(tags);
    const lat = element.lat ?? element.center?.lat;
    const lng = element.lon ?? element.center?.lon;
    const name = tags["name:th"] || tags.name;
    if (!category || !name || typeof lat !== "number" || typeof lng !== "number") continue;
    const key = `${category}|${name}`;
    if (seen.has(key)) continue;
    const distance = haversine(origin.lat, origin.lng, lat, lng);
    if (distance > radiusKm) continue; // กรอบสี่เหลี่ยมมีมุมเกินวงกลม → ตัดที่เกินรัศมีออก
    seen.set(key, { category, name, lat, lng, distanceKm: Math.round(distance * 10) / 10 });
  }
  const groups = [];
  let total = 0;
  for (const { key, label } of CATEGORIES) {
    const inCategory = [];
    for (const item of seen.values()) if (item.category === key) inCategory.push(item);
    const items = takeFirst(mergeSortBy(inCategory, "distanceKm"), perCategory);
    total += items.length;
    groups.push({ key, label, items });
  }
  return { groups, total };
}

export async function getPlaces(point) {
  const radius = config.places.radiusMeters;
  const key = `${roundCoord(point.lat)},${roundCoord(point.lng)},${radius}`;
  const cached = cache.get(key);
  if (cached && cached.fresh) {
    stats.cacheHits += 1;
    return cached.value;
  }
  try {
    stats.upstreamPlaces += 1;
    const requestOptions = (query) => ({ method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `data=${encodeURIComponent(query)}` });
    // ยิงทุกเซิร์ฟเวอร์พร้อมกัน ตัวไหนตอบรูปแบบถูกก่อนใช้ตัวนั้น (Promise.any) — ล่มตัวเดียวไม่ทำให้ฟีเจอร์พัง
    const raw = await Promise.any(
      config.overpass.urls.map(async (url) => {
        const data = await fetchJsonWithTimeout(url, requestOptions(buildQuery(point, radius)), config.overpass.timeoutMs);
        if (!Array.isArray(data?.elements)) throw new Error(`${url}: รูปแบบข้อมูลไม่ถูกต้อง`);
        return data;
      })
    );
    const result = { radiusKm: radius / 1000, ...shapePlaces(raw.elements, point, config.places.perCategory, radius / 1000) };
    cache.set(key, result, config.ttl.places);
    return result;
  } catch (error) {
    // Promise.any ล้มทุกตัว = AggregateError → แสดงสาเหตุของแต่ละเซิร์ฟเวอร์
    console.error("[places]", error.errors ? error.errors.map((e) => e.message).join(" | ") : error.message);
    if (cached) return { ...cached.value, stale: true };
    throw new HttpError(502, "UPSTREAM_UNAVAILABLE", "ดึงข้อมูลสถานที่รอบสวนไม่ได้ในขณะนี้");
  }
}
