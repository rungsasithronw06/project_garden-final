import { mergeSort, copyItems } from "./mergeSort.js";

// [เพิ่มใหม่] เรียงตามความนิยม ทั้งมาก→น้อย และน้อย→มาก (ข้อ 3)
// ยอดผู้เข้าชม 0 ส่วนใหญ่แปลว่า "ไม่มีข้อมูล" (6 จาก 17 แถว) ถ้าเรียงน้อย→มากตรง ๆ สวนเหล่านี้จะมาก่อนและดูเหมือนไม่มีคนไปเลย
// จึงแยกกลุ่มที่ไม่มีข้อมูลไปไว้ท้ายสุดเสมอ แล้วเรียงเฉพาะกลุ่มที่มีข้อมูล
// เวลา O(n) แยกกลุ่ม + O(n log n) Merge Sort = O(n log n) รวม
export function sortByPopularity(gardens, direction) {
  if (direction === "popular") return mergeSort(gardens, "visitors", true);
  if (direction !== "popularAsc") return copyItems(gardens);

  const withData = [];
  const noData = [];
  for (let index = 0; index < gardens.length; index += 1) {
    if (gardens[index].visitors > 0) withData.push(gardens[index]);
    else noData.push(gardens[index]);
  }
  const sorted = mergeSort(withData, "visitors", false);
  for (let index = 0; index < noData.length; index += 1) sorted.push(noData[index]);
  return sorted;
}
