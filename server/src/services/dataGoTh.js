import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";
import { REGION_RESOURCES, VISITORS_RESOURCE_ID } from "../constants.js";
import { TtlCache, stats } from "./cache.js";

const cache = new TtlCache();
const backupPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../data/backup.json");

// อ่าน backup.json ครั้งเดียวแล้วจำไว้ (โค้ดเดิมอ่านใหม่ทุก request)
let backupPromise = null;
function loadBackup() {
  if (!backupPromise) {
    backupPromise = fs
      .readFile(backupPath, "utf8")
      .then((text) => JSON.parse(text))
      .catch(() => ({ resources: {} }));
  }
  return backupPromise;
}

// ดึง resource เดียว ลำดับ: cache สด → API → cache เก่า → backup.json
export async function loadResource(resourceId) {
  const cached = cache.get(resourceId);
  if (cached && cached.fresh) {
    stats.cacheHits += 1;
    return { records: cached.value, source: "cache" };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.fetchTimeoutMs);
    const url = `${config.dataGoTh.baseUrl}?resource_id=${encodeURIComponent(resourceId)}&limit=${config.dataGoTh.limit}`;
    stats.upstreamDataGoTh += 1;
    const response = await fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
    if (!response.ok) throw new Error(`data.go.th HTTP ${response.status}`);
    const data = await response.json();
    const records = data?.result?.records;
    if (!Array.isArray(records)) throw new Error("data.go.th: รูปแบบข้อมูลไม่ถูกต้อง");
    cache.set(resourceId, records, config.ttl.gardens);
    return { records, source: "api" };
  } catch (error) {
    if (cached) return { records: cached.value, source: "stale-cache" };
    const backup = await loadBackup();
    const rows = backup.resources?.[resourceId];
    if (Array.isArray(rows)) return { records: rows, source: "backup" };
    throw error;
  }
}

// ดึงทุกชุดพร้อมกัน (โค้ดเดิมดึงทีละชุด) ชุดไหนล้มเหลวก็ไม่ทำให้ชุดอื่นพัง
export async function loadAllResources() {
  const ids = [...Object.values(REGION_RESOURCES).map((r) => r.resourceId), VISITORS_RESOURCE_ID];
  const settled = await Promise.allSettled(ids.map((id) => loadResource(id)));
  const resources = {};
  const sources = {};
  for (let index = 0; index < ids.length; index += 1) {
    const result = settled[index];
    resources[ids[index]] = result.status === "fulfilled" ? result.value.records : [];
    sources[ids[index]] = result.status === "fulfilled" ? result.value.source : "unavailable";
  }
  return { resources, sources };
}
