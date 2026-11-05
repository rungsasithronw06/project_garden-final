import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeSortBy } from "../src/utils/mergeSort.js";
import { shapeWeather, describeCode, buildAdvice } from "../src/services/weather.js";
import { classify, shapePlaces } from "../src/services/places.js";
import { getRoadRoutes } from "../src/services/routing.js";
import { parseGardenId } from "../src/utils/validate.js";

test("mergeSortBy เรียงน้อย→มาก และเสถียร (ค่าเท่ากันคงลำดับเดิม)", () => {
  const items = [{ n: "a", k: 2 }, { n: "b", k: 1 }, { n: "c", k: 2 }, { n: "d", k: 1 }];
  assert.deepEqual(mergeSortBy(items, "k").map((item) => item.n), ["b", "d", "a", "c"]);
});

test("getRoadRoutes: เรียก OSRM แล้วแปลงหน่วย; ถ้าล่มถอยไปค่าประมาณเส้นตรง", async () => {
  const realFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ code: "Ok", distances: [[12345, null]], durations: [[1800, null]] }) });
    const o = { lat: 13.1, lng: 100.1 };
    const ok = await getRoadRoutes(o, [{ lat: 13.2, lng: 100.2 }, { lat: 13.3, lng: 100.3 }]);
    assert.deepEqual(ok[0], { distanceKm: 12.3, durationMin: 30, source: "osrm" });
    assert.equal(ok[1].source, "estimate"); // OSRM หาเส้นทางไม่ได้ (null)

    globalThis.fetch = async () => { throw new Error("network down"); };
    const origin2 = { lat: 15.1, lng: 101.1 };
    const fallback = await getRoadRoutes(origin2, [{ lat: 15.2, lng: 101.2 }]);
    assert.equal(fallback[0].source, "estimate");
    assert.equal(fallback[0].durationMin, null);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("weather: แปลงรหัสอากาศ + ตัดข้อมูล + คำแนะนำ", () => {
  assert.equal(describeCode(63).text, "ฝนปานกลาง");
  assert.equal(describeCode(12345).text, "ไม่ทราบสภาพอากาศ");
  assert.match(buildAdvice({ rainChance: 80, maxC: 30 }), /ร่ม/);
  assert.match(buildAdvice({ rainChance: 10, maxC: 37 }), /ร้อน/);
  const shaped = shapeWeather({
    current: { temperature_2m: 31.6, apparent_temperature: 36.2, relative_humidity_2m: 70, weather_code: 2, wind_speed_10m: 8.4 },
    daily: { time: ["2026-11-05"], weather_code: [61], temperature_2m_max: [33.4], temperature_2m_min: [24.1], precipitation_probability_max: [75] }
  });
  assert.equal(shaped.current.tempC, 32);
  assert.equal(shaped.daily[0].rainChance, 75);
  assert.match(shaped.advice, /ร่ม/);
  assert.throws(() => shapeWeather({}));
});

test("places: จัดหมวด ตัดชื่อซ้ำ เรียงตามระยะ จำกัดจำนวนต่อหมวด", () => {
  assert.equal(classify({ amenity: "cafe" }), "eat");
  assert.equal(classify({ tourism: "viewpoint" }), "see");
  assert.equal(classify({ shop: "x" }), null);
  const o = { lat: 14, lng: 100 };
  const elements = [
    { lat: 14.05, lon: 100, tags: { amenity: "cafe", name: "คาเฟ่ไกล" } },
    { lat: 14.01, lon: 100, tags: { amenity: "restaurant", name: "ร้านใกล้" } },
    { center: { lat: 14.01, lon: 100 }, tags: { amenity: "restaurant", name: "ร้านใกล้" } }, // ซ้ำ
    { lat: 14.02, lon: 100, tags: { tourism: "hotel", "name:th": "โรงแรมไทย", name: "Hotel" } },
    { lat: 14.02, lon: 100, tags: { amenity: "restaurant" } } // ไม่มีชื่อ
  ];
  const { groups, total } = shapePlaces(elements, o, 5);
  assert.equal(total, 3);
  assert.deepEqual(groups.find((g) => g.key === "eat").items.map((i) => i.name), ["ร้านใกล้", "คาเฟ่ไกล"]);
  assert.equal(groups.find((g) => g.key === "stay").items[0].name, "โรงแรมไทย");
  assert.equal(shapePlaces(elements, o, 1).groups.find((g) => g.key === "eat").items.length, 1);
});

test("validate: id สวน", () => {
  assert.equal(parseGardenId("south-3"), "south-3");
  assert.throws(() => parseGardenId("../etc/passwd"), { code: "INVALID_ID" });
});
