// Normalize: ทำชื่อให้เป็นรูปแบบเดียวกันเพื่อจับคู่ข้อมูลต่างแหล่ง
export function normalizeName(value) {
  return String(value || "").toLowerCase().replace(/สวนพฤกษศาสตร์/g, "").replace(/\s+/g, "").trim();
}
