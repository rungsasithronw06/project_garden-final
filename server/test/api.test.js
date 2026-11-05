// ทดสอบ endpoint จริงผ่าน HTTP โดย "ปลอม" บริการภายนอก (ไม่ต้องใช้เน็ต) — data.go.th ล่ม → ใช้ backup.json
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/app.js";

const realFetch = globalThis.fetch;
let server;
let base;

before(async () => {
  globalThis.fetch = async (url, options) => {
    const text = String(url);
    if (text.startsWith(base)) return realFetch(url, options); // เรียก Express ของเราเอง
    if (text.includes("data.go.th")) throw new Error("offline");
    if (text.includes("/table/v1/driving/")) {
      const count = text.split("destinations=")[1].split("&")[0].split(";").length;
      const row = (value) => Array.from({ length: count }, (_, i) => value + i * 10000);
      return { ok: true, json: async () => ({ code: "Ok", distances: [row(20000)], durations: [row(1500)] }) };
    }
    if (text.includes("api.open-meteo.com")) {
      return { ok: true, json: async () => ({
        current: { temperature_2m: 30, apparent_temperature: 34, relative_humidity_2m: 60, weather_code: 1, wind_speed_10m: 5 },
        daily: { time: ["2026-11-05"], weather_code: [1], temperature_2m_max: [32], temperature_2m_min: [24], precipitation_probability_max: [10] }
      }) };
    }
    if (text.includes("overpass")) return { ok: true, json: async () => ({ elements: [{ lat: 14, lon: 100, tags: { amenity: "cafe", name: "คาเฟ่ทดสอบ" } }] }) };
    throw new Error(`unexpected fetch ${text}`);
  };
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  globalThis.fetch = realFetch;
  server.close();
});

const get = async (path) => {
  const response = await realFetch(base + path);
  return { status: response.status, body: await response.json() };
};

test("/api/route: คืนระยะ+เวลาถนนจริง และพิกัดนอกประเทศ → 400", async () => {
  const ok = await get("/api/route?fromLat=13.75&fromLng=100.5&toLat=14.5&toLng=101");
  assert.equal(ok.status, 200);
  assert.equal(ok.body.source, "osrm");
  assert.equal((await get("/api/route?fromLat=0&fromLng=0&toLat=14.5&toLng=101")).status, 400);
});

test("/api/gardens/:id/weather และ /places ทำงานกับสวนที่มีพิกัด", async () => {
  const { body } = await get("/api/gardens");
  const garden = body.gardens.find((g) => g.lat !== null);
  const weather = await get(`/api/gardens/${garden.id}/weather`);
  assert.equal(weather.status, 200);
  assert.equal(weather.body.current.tempC, 30);
  const places = await get(`/api/gardens/${garden.id}/places`);
  assert.equal(places.status, 200);
  assert.equal(places.body.total, 1);
});

test("/api/gardens/:id/weather: id ไม่มีจริง → 404, id แปลก → 400", async () => {
  assert.equal((await get("/api/gardens/north-99999/weather")).status, 404);
  assert.equal((await get("/api/gardens/BAD!ID/weather")).status, 400);
});

test("บริการอากาศล่ม → 502 พร้อมข้อความไทยที่อ่านรู้เรื่อง (ไม่ใช่ข้อความกลาง ๆ)", async () => {
  const previous = globalThis.fetch;
  const wrapped = async (url, options) => (String(url).includes("api.open-meteo.com") ? Promise.reject(new Error("down")) : previous(url, options));
  globalThis.fetch = wrapped;
  try {
    const { body } = await get("/api/gardens");
    // ใช้พิกัดใหม่ที่ยังไม่มี cache: สวนที่ 2 ที่มีพิกัด
    const garden = body.gardens.filter((g) => g.lat !== null)[1];
    const response = await get(`/api/gardens/${garden.id}/weather`);
    assert.equal(response.status, 502);
    assert.match(response.body.error.message, /สภาพอากาศ/);
  } finally {
    globalThis.fetch = previous;
  }
});
