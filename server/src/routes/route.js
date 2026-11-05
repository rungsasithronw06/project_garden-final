import { Router } from "express";
import { asyncHandler } from "../utils/errors.js";
import { parsePoint } from "../utils/validate.js";
import { getRoadRoutes } from "../services/routing.js";

const router = Router();

// GET /api/route?fromLat=..&fromLng=..&toLat=..&toLng=..
// [แก้ไข] เดิมเรียก Google (ต้องมี key) → ตอนนี้ใช้ OSRM ถนนจริง ไม่ต้องมี key
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const from = parsePoint(req.query.fromLat, req.query.fromLng, "ต้นทาง");
    const to = parsePoint(req.query.toLat, req.query.toLng, "ปลายทาง");
    const [route] = await getRoadRoutes(from, [to]);
    res.json(route);
  })
);

export default router;
