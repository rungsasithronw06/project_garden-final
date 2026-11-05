import { test } from "node:test";
import assert from "node:assert/strict";
import { sortByPopularity } from "./popularity.js";

const gardens = [
  { id: "a", visitors: 500 },
  { id: "b", visitors: 0 },
  { id: "c", visitors: 100 },
  { id: "d", visitors: 900 }
];
const ids = (list) => list.map((garden) => garden.id);

test("มาก→น้อย", () => assert.deepEqual(ids(sortByPopularity(gardens, "popular")), ["d", "a", "c", "b"]));
test("น้อย→มาก: ไม่มีข้อมูล (0) ไปท้ายสุด", () => assert.deepEqual(ids(sortByPopularity(gardens, "popularAsc")), ["c", "a", "d", "b"]));
test("none = ลำดับเดิม และไม่แก้ array ต้นฉบับ", () => {
  assert.deepEqual(ids(sortByPopularity(gardens, "none")), ["a", "b", "c", "d"]);
  assert.deepEqual(ids(gardens), ["a", "b", "c", "d"]);
});
