// รหัสชุดข้อมูลใน data.go.th (ใช้ชุดเดิมจากงานแรก)
export const REGION_RESOURCES = {
  north: { resourceId: "1184397a-7abf-4f5a-a528-5b74861c134c", name: "ภาคเหนือ" },
  central: { resourceId: "14ef5da4-f002-45b2-95b0-57f6a3395a39", name: "ภาคกลาง" },
  northeast: { resourceId: "f0a7c7ef-6b36-4a27-99b8-f5840ca65050", name: "ภาคตะวันออกเฉียงเหนือ" },
  south: { resourceId: "e0791839-d2d7-4cf2-9e7d-bc1ddfb15138", name: "ภาคใต้" },
  west: { resourceId: "807b3e4d-2cd2-44bc-8e89-b1acf3ebcf75", name: "ภาคตะวันตก" }
};

export const VISITORS_RESOURCE_ID = "1d1e76a8-48a1-48d7-b56a-3f1813f8e539";

// ชื่อภาคที่อนุญาตให้ client ส่งมา (whitelist) — "ทั้งหมด" คือไม่กรอง
export const REGION_NAMES = ["ทั้งหมด", ...Object.values(REGION_RESOURCES).map((r) => r.name)];

// กรอบพิกัดคร่าวๆ ของประเทศไทย ใช้ตรวจว่าพิกัดที่ส่งมาสมเหตุสมผล
export const THAILAND_BOUNDS = { minLat: 5, maxLat: 21, minLng: 97, maxLng: 106 };
