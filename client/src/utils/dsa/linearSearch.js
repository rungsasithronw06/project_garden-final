import { normalizeName } from "../text.js";

// DSA ที่ย้ายมาจากโปรเจกต์เดิม (Linear Search) — ไม่ได้แก้ตรรกะ

// Linear Search: ไล่ตรวจสวนทีละรายการและคืนรายการที่ชื่อมีคำค้น
export function linearSearch(gardens, query) {
  // สร้างกล่องว่างไว้เก็บสวนที่ชื่อผ่านการค้นหา
  const result = [];
  // ทำคำค้นให้เป็นรูปแบบเดียวกับชื่อสวนก่อนเปรียบเทียบ
  const keyword = normalizeName(query);
  // เดินดูสวนทีละรายการจากตัวแรกไปตัวสุดท้าย
  for (let index = 0; index < gardens.length; index += 1) {
    // ทำชื่อสวนรายการปัจจุบันให้เป็นรูปแบบเดียวกัน
    const name = normalizeName(gardens[index].name);
    // ถ้าไม่ได้พิมพ์คำค้นหรือชื่อมีคำค้น ให้เก็บสวนรายการนี้
    if (keyword === "" || containsText(name, keyword)) result.push(gardens[index]);
  }
  // ส่งรายการสวนที่ค้นพบกลับไป
  return result;
}

// Contains Text: เทียบตัวอักษรทีละตำแหน่งแทนการใช้คำสั่งค้นหาสำเร็จรูป
export function containsText(text, keyword) {
  // คำว่างถือว่าตรงกับทุกข้อความ
  if (keyword === "") return true;
  // ถ้าคำค้นยาวกว่าข้อความ แปลว่าไม่มีทางตรงกัน
  if (keyword.length > text.length) return false;
  // ลองวางคำค้นทีละตำแหน่งในข้อความ
  for (let start = 0; start <= text.length - keyword.length; start += 1) {
    // สมมติว่าตำแหน่งนี้ตรงกันก่อน
    let matched = true;
    // เทียบตัวอักษรของคำค้นทีละตัว
    for (let offset = 0; offset < keyword.length; offset += 1) {
      // ถ้ามีตัวใดไม่ตรง ให้ยกเลิกตำแหน่งนี้
      if (text[start + offset] !== keyword[offset]) matched = false;
    }
    // ถ้าตัวอักษรตรงกันทุกตัว ให้ตอบว่าพบคำค้น
    if (matched) return true;
  }
  // ลองครบทุกตำแหน่งแล้วแต่ไม่พบคำค้น
  return false;
}
