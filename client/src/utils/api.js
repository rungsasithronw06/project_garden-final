// ห่อ fetch ให้โยน Error พร้อมข้อความภาษาไทยจาก server เมื่อสถานะไม่ใช่ 2xx
export async function fetchJson(url, { signal } = {}) {
  const response = await fetch(url, { signal });
  let body = null;
  try {
    body = await response.json();
  } catch {
    // ไม่ใช่ JSON — ใช้ข้อความมาตรฐานด้านล่าง
  }
  if (!response.ok) {
    throw new Error(body?.error?.message || `เกิดข้อผิดพลาด (${response.status})`);
  }
  return body;
}
