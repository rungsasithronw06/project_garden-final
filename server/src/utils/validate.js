import { HttpError } from "./errors.js";
import { REGION_NAMES, THAILAND_BOUNDS } from "../constants.js";

// ตรวจชื่อภาคตามรายการที่อนุญาต
export function parseRegion(value) {
  const region = value === undefined || value === "" ? "ทั้งหมด" : String(value);
  if (!REGION_NAMES.includes(region)) {
    throw new HttpError(400, "INVALID_REGION", "ชื่อภาคไม่ถูกต้อง");
  }
  return region;
}

// ตรวจว่าเป็นตัวเลขจริงและอยู่ในช่วงที่กำหนด
function parseNumberInRange(value, min, max, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, "INVALID_COORDINATE", `ต้องระบุ ${label}`);
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new HttpError(400, "INVALID_COORDINATE", `${label} อยู่นอกช่วงที่รองรับ`);
  }
  return number;
}

export function parsePoint(latValue, lngValue, label) {
  const { minLat, maxLat, minLng, maxLng } = THAILAND_BOUNDS;
  return {
    lat: parseNumberInRange(latValue, minLat, maxLat, `${label} (lat)`),
    lng: parseNumberInRange(lngValue, minLng, maxLng, `${label} (lng)`)
  };
}

// [เพิ่มใหม่] id สวนต้องมีรูปแบบเดียวกับที่ gardenBuilder สร้าง เช่น "south-3" (กันค่าแปลก ๆ)
export function parseGardenId(value) {
  const id = String(value || "");
  if (!/^[a-z]+-[\w-]{1,40}$/.test(id)) throw new HttpError(400, "INVALID_ID", "รหัสสวนไม่ถูกต้อง");
  return id;
}
