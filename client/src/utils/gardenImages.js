import { gardenImageGroups } from "../data/gardenImageGroups.js";
import { normalizeName } from "./text.js";
import { containsText } from "./dsa/linearSearch.js";

// คืนภาพของสวนตามคำนำหน้าชื่อไฟล์ โดยเรียงตามหมายเลขภาพ (ตรรกะเดิมจากโปรเจกต์เก่า)
// ต่างจากเดิมแค่ path: ขึ้นต้นด้วย "/" เพราะ Vite เสิร์ฟโฟลเดอร์ public/ ไว้ที่ราก
export function getGardenImages(garden) {
  const gardenName = normalizeName(garden.name);
  for (let groupIndex = 0; groupIndex < gardenImageGroups.length; groupIndex += 1) {
    const group = gardenImageGroups[groupIndex];
    let matchesGarden = false;
    for (let keywordIndex = 0; keywordIndex < group.keywords.length; keywordIndex += 1) {
      if (containsText(gardenName, normalizeName(group.keywords[keywordIndex]))) matchesGarden = true;
    }
    if (!matchesGarden) continue;
    const imageCount = group.numbers ? group.numbers.length : group.count;
    const images = [];
    for (let imageIndex = 0; imageIndex < imageCount; imageIndex += 1) {
      const number = group.numbers ? group.numbers[imageIndex] : imageIndex + 1;
      const numberText = number < 10 ? `0${number}` : String(number);
      const extension = group.extensions ? group.extensions[imageIndex] : group.extension;
      images.push({ src: `/assets/images/${group.prefix}${numberText}.${extension}`, number: numberText });
    }
    return images;
  }
  return [];
}
