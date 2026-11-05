import { test } from "node:test";
import assert from "node:assert/strict";
import { allowedErrors, approximateSubstringDistance, looseKey, searchGardens } from "./fuzzySearch.js";

// รายชื่อสวนจริงบางส่วนจาก backup.json
const gardens = [
  { id: "1", name: "สวนพฤกษศาสตร์สกุโณทยาน" },
  { id: "2", name: "สวนพฤกษศาสตร์ดอยสุเทพ 60 พรรษา มหาราชินี" },
  { id: "3", name: "สวนพฤกษศาสตร์ดงมะอี่" },
  { id: "4", name: "สวนพฤกษศาสตร์ภูฝอยลม 60 พรรษา มหาราขินี" },
  { id: "5", name: "สวนพฤกษศาสตร์เขาประทับช้าง60พรรษา มหาราชินี" },
  { id: "6", name: "สวนพฤกษศาสตร์บ้านจอมบึง" }
];
const ids = (list) => list.map((garden) => garden.id);

test("approximateSubstringDistance: ตรงตัว = 0, ผิด 1 ตัว = 1", () => {
  assert.equal(approximateSubstringDistance("abc", "xxabcxx"), 0);
  assert.equal(approximateSubstringDistance("abd", "xxabcxx"), 1);
  assert.equal(approximateSubstringDistance("abc", ""), 3);
});

test("allowedErrors: คำสั้นไม่เดา คำยาวยอมผิดได้มากขึ้น", () => {
  assert.equal(allowedErrors(2), 0);
  assert.equal(allowedErrors(4), 1);
  assert.equal(allowedErrors(8), 2);
});

test("looseKey: ตัดวรรณยุกต์และช่องว่าง", () => {
  assert.equal(looseKey("มะอี่"), looseKey("มะอี"));
});

test("พฤติกรรมเดิมไม่เปลี่ยน: คำค้นว่างได้ทุกสวน, คำที่ตรงตัวได้ผลเดิม", () => {
  assert.equal(searchGardens(gardens, "").length, gardens.length);
  assert.deepEqual(ids(searchGardens(gardens, "ดอยสุเทพ")), ["2"]);
});

test("พิมพ์ผิดแล้วยังเจอ", () => {
  assert.deepEqual(ids(searchGardens(gardens, "ดอยสุเทบ")), ["2"]); // พ → บ
  assert.deepEqual(ids(searchGardens(gardens, "ดงมะอี้")), ["3"]); // ใส่วรรณยุกต์ผิด (้ แทน ่) — looseKey ตัดวรรณยุกต์ทิ้งจึงตรงกัน
  assert.deepEqual(ids(searchGardens(gardens, "ภูฟอยลม")), ["4"]); // ฝ → ฟ
  assert.deepEqual(ids(searchGardens(gardens, "จอมบุง")), ["6"]); // สระผิด (ุ แทน ึ)
  assert.deepEqual(ids(searchGardens(gardens, "สกุโนทยาน")), ["1"]); // ณ → น
});

test("คำค้นสั้นเกินไปหรือไม่เกี่ยวกับสวนใดเลย = ไม่เจอ", () => {
  assert.deepEqual(searchGardens(gardens, "ทบ"), []);
  assert.deepEqual(searchGardens(gardens, "ภูเก็ตไอร์แลนด์"), []);
});
