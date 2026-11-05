// [เพิ่มใหม่ — ไม่ได้มีในโปรเจกต์เดิม] ค้นหาแบบพิมพ์ผิดก็ยังเจอ (Fuzzy Search)
// แนวคิด: ใช้ Edit Distance (Levenshtein) ด้วย Dynamic Programming
//   = จำนวนครั้งน้อยที่สุดของการ "เพิ่ม / ลบ / แทนที่" ตัวอักษร เพื่อให้สองข้อความเหมือนกัน
// แล้วใช้รูปแบบที่ปรับให้ "คำค้นไปตรงตรงไหนของชื่อสวนก็ได้" (Sellers' algorithm)
// เวลา O(m·n) ต่อชื่อสวน เมื่อ m = ความยาวคำค้น, n = ความยาวชื่อสวน
import { normalizeName } from "../text.js";
import { linearSearch } from "./linearSearch.js";
import { mergeSort } from "./mergeSort.js";

// Loose Key: ทำข้อความให้ "หลวม" ขึ้นกว่า normalizeName ด้วยการตัดวรรณยุกต์และทัณฑฆาต
// (่ ้ ๊ ๋ ์ = U+0E48 ถึง U+0E4C) เพราะคนไทยพิมพ์ผิดวรรณยุกต์บ่อย เช่น "มะอี่" กับ "มะอี"
export function looseKey(value) {
  return normalizeName(value).replace(/[\u0E48-\u0E4C]/g, "");
}

// Allowed Errors: คำค้นยิ่งยาวยิ่งยอมให้ผิดได้มาก ป้องกันคำสั้น ๆ ไปตรงกับสวนมั่ว ๆ
//   1-2 ตัวอักษร = ต้องตรงเป๊ะ, 3-4 ตัว = ผิดได้ 1 จุด, 5 ตัวขึ้นไป = ผิดได้ 2 จุด
export function allowedErrors(length) {
  if (length <= 2) return 0;
  if (length <= 4) return 1;
  return 2;
}

// Approximate Substring Distance: หาจำนวนความผิดพลาดน้อยที่สุดระหว่าง pattern กับ "ส่วนใดส่วนหนึ่ง" ของ text
// DP แบบเก็บแค่ 1 คอลัมน์: column[i] = ความผิดพลาดน้อยสุดที่ทำให้ pattern ตัวแรก ๆ i ตัว ตรงกับข้อความที่จบ ณ ตำแหน่งปัจจุบัน
export function approximateSubstringDistance(pattern, text) {
  // m = ความยาวคำค้น
  const m = pattern.length;
  // เริ่มต้น: ถ้าจับคู่ pattern i ตัวกับข้อความว่าง ต้องลบ i ตัว จึงมีค่าความผิดเท่ากับ i
  const column = [];
  for (let i = 0; i <= m; i += 1) column.push(i);
  // ค่าดีที่สุดที่เจอ (เริ่มจากกรณีจับคู่กับข้อความว่างทั้งหมด = m)
  let best = m;
  // เดินดูตัวอักษรของชื่อสวนทีละตัว
  for (let j = 0; j < text.length; j += 1) {
    // เก็บค่าเดิมของช่องทแยงมุม (ตำแหน่ง i-1 ของคอลัมน์ก่อนหน้า)
    let diagonal = column[0];
    // แถวบนสุดเป็น 0 เสมอ = ยอมให้คำค้นเริ่มจับคู่ตรงตำแหน่งไหนของชื่อก็ได้โดยไม่เสียคะแนน
    column[0] = 0;
    for (let i = 1; i <= m; i += 1) {
      // จำค่าเดิมของช่องนี้ไว้ใช้เป็นช่องทแยงมุมของรอบถัดไป
      const previousValue = column[i];
      // ถ้าตัวอักษรตรงกัน ไม่เสียคะแนน ถ้าไม่ตรง เสีย 1 (แทนที่ตัวอักษร)
      const replaceCost = pattern[i - 1] === text[j] ? 0 : 1;
      // เลือกวิธีที่เสียน้อยที่สุดจาก 3 แบบ: ข้ามตัวอักษรในชื่อ / ข้ามตัวอักษรในคำค้น / จับคู่หรือแทนที่
      const skipTextChar = previousValue + 1;
      const skipPatternChar = column[i - 1] + 1;
      const matchOrReplace = diagonal + replaceCost;
      let cheapest = skipTextChar;
      if (skipPatternChar < cheapest) cheapest = skipPatternChar;
      if (matchOrReplace < cheapest) cheapest = matchOrReplace;
      column[i] = cheapest;
      diagonal = previousValue;
    }
    // ช่องล่างสุด = คำค้นทั้งหมดจับคู่กับข้อความที่จบ ณ ตำแหน่งนี้ ถ้าดีกว่าเดิมให้จำไว้
    if (column[m] < best) best = column[m];
  }
  return best;
}

// Search Gardens: ฟังก์ชันค้นหาที่หน้าเว็บเรียกใช้ (แทน linearSearch ตรง ๆ)
// ขั้นที่ 1: ลอง linearSearch เดิมก่อน — ถ้ามีสวนที่ชื่อมีคำค้นตรง ๆ ให้ใช้ผลเดิมทั้งหมด (พฤติกรรมเหมือนเดิม)
// ขั้นที่ 2: ถ้าไม่เจอเลย ค่อยใช้ Edit Distance หาสวนที่ "ชื่อใกล้เคียง" แล้วเรียงจากผิดน้อยไปมาก
export function searchGardens(gardens, query) {
  // ขั้นที่ 1: ค้นหาแบบตรงตัว (คำค้นว่างจะได้สวนทั้งหมดกลับมา)
  const exactMatches = linearSearch(gardens, query);
  if (exactMatches.length > 0) return exactMatches;

  // ขั้นที่ 2: เตรียมคำค้นแบบหลวม และดูว่ายอมให้ผิดได้กี่จุด
  const keyword = looseKey(query);
  const maxErrors = allowedErrors(keyword.length);
  // คำค้นสั้นเกินไปไม่ลองเดา
  if (maxErrors === 0) return [];

  // วัดความผิดพลาดของทุกสวน เก็บเฉพาะสวนที่ผิดไม่เกินที่ยอมรับ
  const candidates = [];
  for (let index = 0; index < gardens.length; index += 1) {
    const errors = approximateSubstringDistance(keyword, looseKey(gardens[index].name));
    if (errors <= maxErrors) candidates.push({ garden: gardens[index], errors });
  }

  // เรียงจากผิดน้อยไปมากด้วย Merge Sort เดิม (เสถียร: ผิดเท่ากันคงลำดับเดิมของข้อมูล)
  const ranked = mergeSort(candidates, "errors", false);
  const result = [];
  for (let index = 0; index < ranked.length; index += 1) result.push(ranked[index].garden);
  return result;
}
