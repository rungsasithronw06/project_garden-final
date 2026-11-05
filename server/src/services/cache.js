// cache ในหน่วยความจำแบบมีอายุ (TTL)
// get() คืนค่าแม้หมดอายุแล้ว พร้อมบอกว่า fresh หรือไม่ เพื่อใช้เป็นข้อมูลสำรองตอน API ต้นทางล่ม
// โครงสร้างข้อมูล: Hash Map (Map) → get/set เฉลี่ย O(1)
export class TtlCache {
  #store = new Map();

  get(key) {
    const entry = this.#store.get(key);
    if (!entry) return null;
    return { value: entry.value, fresh: Date.now() < entry.expiresAt };
  }

  set(key, value, ttlMs) {
    this.#store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  get size() {
    return this.#store.size;
  }
}

// ตัวนับไว้ใช้เทียบ Before → After ตอนทำรายงาน (เรียก API ต้นทางกี่ครั้ง)
// [เพิ่มใหม่] เพิ่มตัวนับของเส้นทาง / สภาพอากาศ / สถานที่รอบสวน (ตัวนับ Google เดิมถูกแทนที่ด้วย upstreamRouting)
export const stats = { upstreamDataGoTh: 0, upstreamRouting: 0, upstreamWeather: 0, upstreamPlaces: 0, cacheHits: 0 };
