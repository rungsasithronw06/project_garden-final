// Haversine: ระยะทางเส้นตรงบนผิวโลก (กม.) — ใช้เป็นค่าประมาณสำรองเมื่อเรียก Google ไม่ได้
export function haversine(lat1, lng1, lat2, lng2) {
  const earthRadius = 6371;
  const toRadians = (degree) => (degree * Math.PI) / 180;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);
  const first =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(first), Math.sqrt(1 - first));
}
