import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildGardens, filterByRegion, normalizeName, readCoordinates } from "../src/services/gardenBuilder.js";
import { parsePoint, parseRegion } from "../src/utils/validate.js";

const backup = JSON.parse(fs.readFileSync(new URL("../data/backup.json", import.meta.url), "utf8"));

test("readCoordinates แยก lat/lng จาก URL", () => {
  const { lat, lng } = readCoordinates("https://x.th/a.html?id=1&lat=16.8&lng=100.5");
  assert.equal(lat, 16.8);
  assert.equal(lng, 100.5);
});

test("normalizeName ตัดคำนำหน้าและช่องว่าง", () => {
  assert.equal(normalizeName("สวนพฤกษศาสตร์ ดอย สุเทพ"), "ดอยสุเทพ");
});

test("buildGardens รวมสวนจากทุกภาค และเลือก visitors เป็น null เมื่อจับคู่ไม่ได้", () => {
  const { gardens, unmatchedVisitorNames } = buildGardens(backup.resources);
  assert.ok(gardens.length > 0);
  for (const garden of gardens) assert.ok(garden.visitors === null || typeof garden.visitors === "number");
  assert.ok(Array.isArray(unmatchedVisitorNames));
});

test("filterByRegion กรองตามภาค", () => {
  const { gardens } = buildGardens(backup.resources);
  const south = filterByRegion(gardens, "ภาคใต้");
  assert.ok(south.every((garden) => garden.region === "ภาคใต้"));
});

test("validate: ปฏิเสธภาคที่ไม่รู้จัก และพิกัดนอกประเทศ", () => {
  assert.throws(() => parseRegion("ภาคอื่น"), { code: "INVALID_REGION" });
  assert.throws(() => parsePoint("0", "0", "ต้นทาง"), { code: "INVALID_COORDINATE" });
  assert.deepEqual(parsePoint("13.7", "100.5", "ต้นทาง"), { lat: 13.7, lng: 100.5 });
});
