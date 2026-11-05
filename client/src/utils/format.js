// [เพิ่มใหม่] ฟังก์ชันจัดรูปข้อความที่ใช้ซ้ำหลาย component

// 95 → "1 ชม. 35 นาที", 40 → "40 นาที", null → "-"
export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined) return "-";
  if (minutes < 60) return `${minutes} นาที`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} ชม.` : `${hours} ชม. ${rest} นาที`;
}

// ลิงก์ Google Maps (ไม่ต้องใช้ API key) — ไม่ใส่ origin = ให้ Google ใช้ตำแหน่งปัจจุบันของผู้ใช้
export function directionsUrl(destination, origin) {
  const originPart = origin ? `&origin=${origin.lat},${origin.lng}` : "";
  return `https://www.google.com/maps/dir/?api=1${originPart}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
}

// [แก้ไข] เดิมส่งแค่พิกัด (query=lat,lng) → Google ปักหมุดกลางแผนที่ ไม่รู้ว่าเป็นร้านอะไร
// ตอนนี้ค้นด้วย "ชื่อสถานที่" แล้วให้แผนที่ซูมอยู่ที่พิกัดนั้น (/@lat,lng,17z) → Google เปิดหน้าร้านจริงที่ใกล้ที่สุด
// (รูปแบบ /search/ชื่อ/@lat,lng,zoom ใช้กันทั่วไปแต่ไม่ได้อยู่ในเอกสารทางการของ Google)
export function placeUrl(place) {
  return `https://www.google.com/maps/search/${encodeURIComponent(place.name)}/@${place.lat},${place.lng},17z`;
}
