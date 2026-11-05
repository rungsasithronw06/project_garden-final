// [เพิ่มใหม่] สภาพอากาศจาก Open-Meteo (ฟรี ไม่ต้องใช้ key)
// Express ไม่ได้แค่ส่งต่อ: แปลงรหัสอากาศ WMO เป็นข้อความไทย, ตัดข้อมูลที่ไม่ใช้, และสรุปคำแนะนำเที่ยวสวน
import { config } from "../config.js";
import { HttpError } from "../utils/errors.js";
import { fetchJsonWithTimeout, roundCoord } from "../utils/http.js";
import { TtlCache, stats } from "./cache.js";

const cache = new TtlCache();

// รหัสอากาศ WMO → ข้อความไทย + ไอคอน (Hash Map: ค้นหา O(1))
const WEATHER_CODES = new Map([
  [0, ["ท้องฟ้าแจ่มใส", "☀️"]], [1, ["แจ่มใสเป็นส่วนใหญ่", "🌤️"]], [2, ["มีเมฆบางส่วน", "⛅"]], [3, ["เมฆมาก", "☁️"]],
  [45, ["หมอก", "🌫️"]], [48, ["หมอกจัด", "🌫️"]],
  [51, ["ฝนปรอยเล็กน้อย", "🌦️"]], [53, ["ฝนปรอย", "🌦️"]], [55, ["ฝนปรอยหนัก", "🌦️"]],
  [61, ["ฝนเล็กน้อย", "🌧️"]], [63, ["ฝนปานกลาง", "🌧️"]], [65, ["ฝนหนัก", "🌧️"]],
  [80, ["ฝนฟ้าคะนองเล็กน้อย", "🌦️"]], [81, ["ฝนตกเป็นช่วง ๆ", "🌧️"]], [82, ["ฝนตกหนักเป็นช่วง ๆ", "⛈️"]],
  [95, ["พายุฝนฟ้าคะนอง", "⛈️"]], [96, ["พายุฝนฟ้าคะนอง มีลูกเห็บ", "⛈️"]], [99, ["พายุฝนฟ้าคะนองรุนแรง", "⛈️"]]
]);

export function describeCode(code) {
  const found = WEATHER_CODES.get(code);
  return found ? { text: found[0], icon: found[1] } : { text: "ไม่ทราบสภาพอากาศ", icon: "❔" };
}

// สรุปคำแนะนำจากข้อมูลวันนี้ (ตรรกะประมวลผลฝั่ง server)
export function buildAdvice({ rainChance, maxC }) {
  if (rainChance >= 60) return "โอกาสฝนสูง ควรพกร่มหรือเสื้อกันฝน และระวังทางลื่นในสวน";
  if (maxC >= 35) return "อากาศร้อนจัด แนะนำเดินช่วงเช้าหรือเย็น และพกน้ำดื่ม";
  if (rainChance >= 30) return "มีโอกาสฝนบ้าง พกร่มพับติดตัวไว้จะอุ่นใจกว่า";
  return "อากาศเหมาะกับการเดินชมสวน";
}

// ตัดข้อมูลดิบของ Open-Meteo ให้เหลือเท่าที่หน้าเว็บใช้
export function shapeWeather(raw) {
  const current = raw?.current;
  const daily = raw?.daily;
  if (!current || !daily?.time) throw new Error("Open-Meteo: รูปแบบข้อมูลไม่ถูกต้อง");
  const days = [];
  for (let index = 0; index < daily.time.length; index += 1) {
    days.push({
      date: daily.time[index],
      ...describeCode(daily.weather_code[index]),
      minC: Math.round(daily.temperature_2m_min[index]),
      maxC: Math.round(daily.temperature_2m_max[index]),
      rainChance: daily.precipitation_probability_max?.[index] ?? 0
    });
  }
  return {
    current: {
      tempC: Math.round(current.temperature_2m),
      feelsLikeC: Math.round(current.apparent_temperature),
      humidity: Math.round(current.relative_humidity_2m),
      windKmh: Math.round(current.wind_speed_10m),
      ...describeCode(current.weather_code)
    },
    daily: days,
    advice: buildAdvice({ rainChance: days[0]?.rainChance ?? 0, maxC: days[0]?.maxC ?? 0 })
  };
}

export async function getWeather(point) {
  const key = `${roundCoord(point.lat)},${roundCoord(point.lng)}`;
  const cached = cache.get(key);
  if (cached && cached.fresh) {
    stats.cacheHits += 1;
    return cached.value;
  }
  try {
    const url =
      `${config.openMeteo.baseUrl}?latitude=${point.lat}&longitude=${point.lng}` +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
      "&timezone=Asia%2FBangkok&forecast_days=3";
    stats.upstreamWeather += 1;
    const shaped = shapeWeather(await fetchJsonWithTimeout(url, {}, 8000));
    cache.set(key, shaped, config.ttl.weather);
    return shaped;
  } catch (error) {
    console.error("[weather]", error.message);
    if (cached) return { ...cached.value, stale: true };
    throw new HttpError(502, "UPSTREAM_UNAVAILABLE", "ดึงข้อมูลสภาพอากาศไม่ได้ในขณะนี้");
  }
}
