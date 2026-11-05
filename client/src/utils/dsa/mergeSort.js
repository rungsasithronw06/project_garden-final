// DSA ที่ย้ายมาจากโปรเจกต์เดิม (Merge Sort และฟังก์ชันช่วยที่เขียน loop เอง) — ไม่ได้แก้ตรรกะ

// Merge Sort: แบ่งข้อมูลเป็นครึ่ง แล้วรวมกลับโดยใช้ key และทิศทางที่กำหนด
export function mergeSort(items, key, descending, tieKey, tieDescending) {
  // ถ้ามีข้อมูลไม่ถึงสองรายการ ไม่ต้องแบ่งต่อ
  if (items.length < 2) return copyItems(items);
  // หาจุดกึ่งกลางของรายการ
  const middle = Math.floor(items.length / 2);
  // คัดลอกครึ่งซ้ายด้วย loop ของเราเอง
  const leftItems = copyRange(items, 0, middle);
  // คัดลอกครึ่งขวาด้วย loop ของเราเอง
  const rightItems = copyRange(items, middle, items.length);
  // เรียงครึ่งซ้ายต่อไปจนเหลือรายการเล็ก ๆ
  const left = mergeSort(leftItems, key, descending, tieKey, tieDescending);
  // เรียงครึ่งขวาต่อไปจนเหลือรายการเล็ก ๆ
  const right = mergeSort(rightItems, key, descending, tieKey, tieDescending);
  // รวมสองฝั่งกลับเป็นรายการที่เรียงแล้ว
  return merge(left, right, key, descending, tieKey, tieDescending);
}

// Copy Range: คัดลอกข้อมูลช่วงที่ต้องการด้วยการไล่ทีละรายการ
function copyRange(items, start, end) {
  // สร้างกล่องว่างสำหรับข้อมูลช่วงใหม่
  const result = [];
  // เดินจากตำแหน่งเริ่มต้นถึงก่อนตำแหน่งสิ้นสุด
  for (let index = start; index < end; index += 1) result.push(items[index]);
  // ส่งข้อมูลช่วงที่คัดลอกแล้วกลับไป
  return result;
}

// Copy Items: ทำสำเนารายการทั้งหมดโดยไม่ใช้คำสั่งคัดลอกสำเร็จรูป
export function copyItems(items) {
  // ใช้ copyRange ตั้งแต่ต้นจนจบรายการ
  return copyRange(items, 0, items.length);
}

// Take First: หยิบข้อมูลจำนวนที่ต้องการจากด้านหน้าโดยใช้ loop
export function takeFirst(items, count) {
  // สร้างกล่องว่างสำหรับผลลัพธ์
  const result = [];
  // หยุดเมื่อครบจำนวนหรือเดินถึงท้ายรายการ
  const limit = items.length < count ? items.length : count;
  // คัดลอกข้อมูลทีละรายการ
  for (let index = 0; index < limit; index += 1) result.push(items[index]);
  // ส่งข้อมูลที่หยิบได้กลับไป
  return result;
}

// Merge: เปรียบเทียบหัวของสองชุดย่อยแล้วสร้างชุดที่เรียงแล้ว
function merge(left, right, key, descending, tieKey, tieDescending) {
  const result = [];
  let leftIndex = 0;
  let rightIndex = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    const leftValue = Number(left[leftIndex][key]) || 0;
    const rightValue = Number(right[rightIndex][key]) || 0;
    const primaryEqual = leftValue === rightValue;
    const leftTieValue = Number(left[leftIndex][tieKey]) || 0;
    const rightTieValue = Number(right[rightIndex][tieKey]) || 0;
    const takeLeft = primaryEqual && tieKey
      ? (tieDescending ? leftTieValue >= rightTieValue : leftTieValue <= rightTieValue)
      : (descending ? leftValue >= rightValue : leftValue <= rightValue);
    result.push(takeLeft ? left[leftIndex++] : right[rightIndex++]);
  }
  while (leftIndex < left.length) result.push(left[leftIndex++]);
  while (rightIndex < right.length) result.push(right[rightIndex++]);
  return result;
}
