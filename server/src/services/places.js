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

export function buildQuery(point, radiusMeters) {
  const around = `(around:${radiusMeters},${point.lat},${point.lng})`;
  return `[out:json][timeout:20];(nwr${around}["name"]["amenity"~"^(restaurant|cafe|fuel)$"];nwr${around}["name"]["tourism"~"^(hotel|guest_house|resort|hostel|camp_site|attraction|viewpoint|museum|zoo)$"];);out center 300;`;
}

// แปลงผลดิบ → กลุ่มตามหมวด (ฟังก์ชันล้วน ไว้เทสต์)
export function shapePlaces(elements, origin, perCategory) {
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
    seen.set(key, { category, name, lat, lng, distanceKm: Math.round(haversine(origin.lat, origin.lng, lat, lng) * 10) / 10 });
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
    const raw = await fetchJsonWithTimeout(
      config.overpass.url,
      { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `data=${encodeURIComponent(buildQuery(point, radius))}` },
      25000
    );
    if (!Array.isArray(raw?.elements)) throw new Error("Overpass: รูปแบบข้อมูลไม่ถูกต้อง");
    const result = { radiusKm: radius / 1000, ...shapePlaces(raw.elements, point, config.places.perCategory) };
    cache.set(key, result, config.ttl.places);
    return result;
  } catch (error) {
    console.error("[places]", error.message);
    if (cached) return { ...cached.value, stale: true };
    throw new HttpError(502, "UPSTREAM_UNAVAILABLE", "ดึงข้อมูลสถานที่รอบสวนไม่ได้ในขณะนี้");
  }
}
