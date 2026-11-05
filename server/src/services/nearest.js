// [เพิ่มใหม่] เลือก "สวนใกล้ฉัน" — ฟังก์ชันล้วน (ไม่ยิงเน็ต) เขียนเทสต์ง่าย
// DSA ฝั่ง Express: Haversine O(n) → Merge Sort O(n log n) → เลือก K ตัวแรก → ค่อยเรียกเส้นทางจริงเฉพาะ K ตัวนั้น
//
// ทำไมต้องคัดก่อน: เรียก API เส้นทางจริงกับทุกสวนช้าและเปลืองโควตา
// ระยะเส้นตรงเป็น "ค่าต่ำสุด" ของระยะถนน จึงใช้คัดผู้เข้ารอบได้อย่างปลอดภัย (สวนที่ไกลมากเส้นตรง แทบไม่มีทางใกล้สุดทางถนน)
//   Before: ลากเส้นตรงทุกสวน แล้วเรียงตามเส้นตรง (n สวน → ไม่มีข้อมูลถนนเลย)
//   After : เส้นตรง n สวน + ถนนจริง K สวน (K=5) → เรียก API ภายนอก 1 ครั้งต่อการค้นหา ไม่ใช่ n ครั้ง
import { haversine } from "../utils/geo.js";
import { mergeSortBy, takeFirst } from "../utils/mergeSort.js";

export function nearestCandidates(gardens, origin, k) {
  const measured = [];
  for (let index = 0; index < gardens.length; index += 1) {
    const garden = gardens[index];
    // สวนที่ไม่มีพิกัดคำนวณระยะไม่ได้ ข้ามไป
    if (garden.lat === null || garden.lng === null) continue;
    measured.push({ garden, straightKm: haversine(origin.lat, origin.lng, garden.lat, garden.lng) });
  }
  return takeFirst(mergeSortBy(measured, "straightKm"), k);
}

// รวมผลเส้นทางจริงเข้ากับสวน แล้วเรียงใหม่ตาม "ระยะถนน" (ถ้าเป็นค่าประมาณจะใช้เส้นตรงแทน)
export function rankByRoad(candidates, routes) {
  const items = candidates.map(({ garden, straightKm }, index) => {
    const route = routes[index];
    return {
      ...garden,
      straightKm: Math.round(straightKm * 10) / 10,
      roadKm: route.distanceKm,
      durationMin: route.durationMin,
      routeSource: route.source,
      sortKm: route.distanceKm
    };
  });
  const ranked = mergeSortBy(items, "sortKm");
  return ranked.map(({ sortKm, ...rest }) => rest);
}
