import { copyItems } from "./mergeSort.js";

// DSA ที่ย้ายมาจากโปรเจกต์เดิม (Filter ตามภูมิภาค) — ไม่ได้แก้ตรรกะ

// Filter: ไล่เช็คภูมิภาคทีละรายการและเก็บเฉพาะรายการที่ตรงเงื่อนไข
export function filterByRegion(gardens, region) {
  // ถ้าเลือกทุกภาค ให้คัดลอกข้อมูลด้วยฟังก์ชันของเราเอง
  if (region === "ทั้งหมด") return copyItems(gardens);
  // สร้างกล่องว่างสำหรับสวนในภาคที่เลือก
  const result = [];
  // เดินตรวจสวนทีละรายการ
  for (let index = 0; index < gardens.length; index += 1) if (gardens[index].region === region) result.push(gardens[index]);
  // ส่งรายการที่ตรงกับภาคกลับไป
  return result;
}
