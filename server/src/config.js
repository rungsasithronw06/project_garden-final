import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 3001,
  fetchTimeoutMs: 12000,
  // อายุ cache: ข้อมูลสวนเปลี่ยนน้อย จึงเก็บนาน, เส้นทางเก็บตามคู่พิกัด, อากาศเปลี่ยนเร็วจึงเก็บสั้น
  ttl: {
    gardens: 6 * 60 * 60 * 1000,
    route: 24 * 60 * 60 * 1000,
    weather: 30 * 60 * 1000, // [เพิ่มใหม่]
    places: 24 * 60 * 60 * 1000 // [เพิ่มใหม่]
  },
  dataGoTh: {
    baseUrl: "https://data.go.th/api/3/action/datastore_search",
    limit: 1000
  },
  // [เพิ่มใหม่] บริการภายนอก 3 ตัว ทั้งหมดฟรีและไม่ต้องใช้ API key (เปลี่ยน URL ได้ผ่าน .env)
  // *ข้อ 1 ของอาจารย์: API เพิ่มเติมเหล่านี้ควรแจ้งขออนุมัติอาจารย์ก่อน*
  osrm: { baseUrl: process.env.OSRM_BASE_URL || "https://router.project-osrm.org" }, // เส้นทางถนนจริง (OpenStreetMap)
  // สถานที่รอบสวน (OpenStreetMap) — [แก้ไข] ยิงหลายเซิร์ฟเวอร์พร้อมกัน ใครตอบสำเร็จก่อนใช้ตัวนั้น (เซิร์ฟเวอร์ฟรีล่ม/ช้าบ่อย)
  overpass: {
    urls: process.env.OVERPASS_URL
      ? [process.env.OVERPASS_URL]
      : ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter", "https://overpass.kumi.systems/api/interpreter"],
    timeoutMs: 40000
  },
  openMeteo: { baseUrl: process.env.OPEN_METEO_URL || "https://api.open-meteo.com/v1/forecast" }, // สภาพอากาศ
  places: { radiusMeters: 5000, perCategory: 5 }
};
