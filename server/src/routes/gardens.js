import { Router } from "express";
import { asyncHandler, HttpError } from "../utils/errors.js";
import { parseRegion, parseGardenId } from "../utils/validate.js";
import { loadAllResources } from "../services/dataGoTh.js";
import { buildGardens, filterByRegion } from "../services/gardenBuilder.js";
import { getWeather } from "../services/weather.js";
import { getPlaces } from "../services/places.js";

const router = Router();

// โหลด + รวมข้อมูลสวน (ใช้ร่วมกันทุก endpoint ในไฟล์นี้) — โยน 502 ถ้าทุกชุดข้อมูลใช้ไม่ได้
async function loadBuiltGardens() {
  const { resources, sources } = await loadAllResources();
  const allUnavailable = Object.values(sources).every((source) => source === "unavailable");
  if (allUnavailable) throw new HttpError(502, "UPSTREAM_UNAVAILABLE", "ดึงข้อมูลสวนไม่ได้ในขณะนี้");
  return { ...buildGardens(resources), sources };
}

// หาสวนจาก id แล้วเช็คว่ามีพิกัด — ใช้กับสภาพอากาศ/สถานที่รอบสวน
// รับ "id สวน" แทนรับพิกัดจาก client ตรง ๆ → client สั่งให้ server ยิง API ภายนอกกับพิกัดมั่ว ๆ ไม่ได้
async function findGardenWithCoordinates(idValue) {
  const id = parseGardenId(idValue);
  const { gardens } = await loadBuiltGardens();
  // Hash Map: id → สวน (สร้าง O(n) ค้นหา O(1)) — ข้อมูลมีไม่กี่สวน แต่ตั้งใจเขียนให้ขยายได้
  const byId = new Map();
  for (const garden of gardens) byId.set(garden.id, garden);
  const garden = byId.get(id);
  if (!garden) throw new HttpError(404, "GARDEN_NOT_FOUND", "ไม่พบสวนนี้");
  if (garden.lat === null || garden.lng === null) throw new HttpError(422, "NO_COORDINATES", "สวนนี้ไม่มีพิกัดในข้อมูล");
  return garden;
}

// GET /api/gardens?region=ภาคใต้
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const region = parseRegion(req.query.region);
    const { gardens, unmatchedVisitorNames, sources } = await loadBuiltGardens();
    const filtered = filterByRegion(gardens, region);
    const degraded = Object.values(sources).some((source) => !["api", "cache"].includes(source));
    res.json({
      gardens: filtered,
      meta: {
        total: filtered.length,
        region,
        sources,
        warning: degraded ? "บางชุดข้อมูลมาจากข้อมูลสำรอง อาจไม่เป็นปัจจุบัน" : "",
        unmatchedVisitorNames
      }
    });
  })
);

// [เพิ่มใหม่] GET /api/gardens/:id/weather
router.get(
  "/:id/weather",
  asyncHandler(async (req, res) => {
    const garden = await findGardenWithCoordinates(req.params.id);
    res.json(await getWeather(garden));
  })
);

// [เพิ่มใหม่] GET /api/gardens/:id/places
router.get(
  "/:id/places",
  asyncHandler(async (req, res) => {
    const garden = await findGardenWithCoordinates(req.params.id);
    res.json(await getPlaces(garden));
  })
);

export default router;
