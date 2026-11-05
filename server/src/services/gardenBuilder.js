import { REGION_RESOURCES, VISITORS_RESOURCE_ID } from "../constants.js";

// ฟังก์ชันในไฟล์นี้เป็น "ฟังก์ชันล้วน" (ไม่ยิงเน็ต) เพื่อให้เขียนเทสต์ง่าย
// และเป็นจุดที่ควรใส่ DSA ฝั่ง Express (เช่น จับคู่ชื่อสองชุดข้อมูลด้วย Hash Map / Levenshtein)

// Normalize: ทำชื่อให้เป็นรูปแบบเดียวกันเพื่อจับคู่ข้อมูลต่างแหล่ง
export function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/สวนพฤกษศาสตร์/g, "")
    .replace(/\s+/g, "")
    .trim();
}

export function parseNumber(value) {
  const number = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

// แยก lat/lng ที่ฝังอยู่ใน URL ของกรมอุทยานฯ
export function readCoordinates(url) {
  const text = String(url || "");
  const latMatch = text.match(/[?&]lat(?:itude)?=([-+]?\d+(?:\.\d+)?)/i);
  const lngMatch = text.match(/[?&](?:lng|lon|longitude)=([-+]?\d+(?:\.\d+)?)/i);
  return { lat: latMatch ? Number(latMatch[1]) : null, lng: lngMatch ? Number(lngMatch[1]) : null };
}

// Hash Map: ชื่อ (normalize แล้ว) → ยอดผู้เข้าชม  ค้นหาเฉลี่ย O(1) ต่อสวน
export function buildVisitorMap(records) {
  const map = new Map();
  for (const record of records) {
    const key = normalizeName(record["หน่วยงาน"]);
    if (key !== "") map.set(key, parseNumber(record["รวมปี 67"]));
  }
  return map;
}

// รวมสวนจากทุกภาค + จับคู่ยอดผู้เข้าชม
// visitors: ตัวเลข = จับคู่ได้ (0 อาจแปลว่า "ไม่มีข้อมูล" ต้องตัดสินใจตอนแสดงผล), null = จับคู่ไม่ได้
export function buildGardens(resources) {
  const visitorMap = buildVisitorMap(resources[VISITORS_RESOURCE_ID] || []);
  const matchedKeys = new Set();
  const gardens = [];

  for (const [regionKey, { resourceId, name: regionName }] of Object.entries(REGION_RESOURCES)) {
    const rows = resources[resourceId] || [];
    rows.forEach((row, index) => {
      const name = String(row["ชื่อหน่วยงานภาคสนาม"] || "ไม่ระบุชื่อ").trim();
      const key = normalizeName(name);
      const { lat, lng } = readCoordinates(row.URL);
      const hasVisitors = visitorMap.has(key);
      if (hasVisitors) matchedKeys.add(key);
      gardens.push({
        id: `${regionKey}-${row._id ?? index}`,
        name,
        region: regionName,
        address: String(row["ที่อยู่"] || "ไม่ระบุที่อยู่").trim(),
        lat,
        lng,
        detailUrl: row.URL || null,
        visitors: hasVisitors ? visitorMap.get(key) : null
      });
    });
  }

  // ชื่อในชุดผู้เข้าชมที่ไม่มีสวนคู่กัน — ใช้ตรวจว่าชื่อสองชุดสะกดไม่ตรงกันตรงไหน
  const unmatchedVisitorNames = [];
  for (const record of resources[VISITORS_RESOURCE_ID] || []) {
    if (!matchedKeys.has(normalizeName(record["หน่วยงาน"]))) unmatchedVisitorNames.push(record["หน่วยงาน"]);
  }

  return { gardens, unmatchedVisitorNames };
}

// กรองตามภาค (ตรวจชื่อภาคไว้แล้วที่ validate.js)
export function filterByRegion(gardens, region) {
  if (region === "ทั้งหมด") return gardens;
  return gardens.filter((garden) => garden.region === region);
}
