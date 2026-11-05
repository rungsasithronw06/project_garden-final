// [เพิ่มใหม่] Merge Sort ฝั่ง Express: เรียงน้อย→มากตาม key (เสถียร: ค่าเท่ากันคงลำดับเดิม)
// เวลา O(n log n) พื้นที่เพิ่ม O(n) — ใช้ตรรกะเดียวกับ client/src/utils/dsa/mergeSort.js ที่เรียนมา
export function mergeSortBy(items, key) {
  if (items.length < 2) return copyRange(items, 0, items.length);
  const middle = Math.floor(items.length / 2);
  const left = mergeSortBy(copyRange(items, 0, middle), key);
  const right = mergeSortBy(copyRange(items, middle, items.length), key);
  return merge(left, right, key);
}

function copyRange(items, start, end) {
  const result = [];
  for (let index = start; index < end; index += 1) result.push(items[index]);
  return result;
}

function merge(left, right, key) {
  const result = [];
  let leftIndex = 0;
  let rightIndex = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    // <= ทำให้ฝั่งซ้ายมาก่อนเมื่อค่าเท่ากัน = เสถียร
    result.push(left[leftIndex][key] <= right[rightIndex][key] ? left[leftIndex++] : right[rightIndex++]);
  }
  while (leftIndex < left.length) result.push(left[leftIndex++]);
  while (rightIndex < right.length) result.push(right[rightIndex++]);
  return result;
}

// หยิบ k ตัวแรก
export function takeFirst(items, count) {
  const result = [];
  const limit = items.length < count ? items.length : count;
  for (let index = 0; index < limit; index += 1) result.push(items[index]);
  return result;
}
