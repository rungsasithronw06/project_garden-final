// [เพิ่มใหม่] fetch ที่มี timeout และโยน error เมื่อสถานะไม่ใช่ 2xx — ใช้ร่วมกันทุกบริการภายนอก
export async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { "User-Agent": "garden-finder-student-project", ...(options.headers || {}) }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

// ปัดพิกัดเหลือ 3 ตำแหน่ง (~110 ม.) เพื่อให้คำขอที่อยู่ใกล้กันมากใช้ cache ร่วมกันได้
export const roundCoord = (value) => value.toFixed(3);
