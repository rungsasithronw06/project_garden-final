import { useCallback, useMemo, useRef, useState } from "react";
import { fetchJson } from "../utils/api.js";

// [เพิ่มใหม่] ฟีเจอร์ "สวนใกล้ฉัน": ขอตำแหน่งจากเบราว์เซอร์ → ให้ Express คำนวณเส้นทางถนนจริง
// status: idle | locating (รอตำแหน่ง) | loading (รอ Express) | success | empty | error
const GEO_ERRORS = {
  1: "ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง กรุณาเปิดสิทธิ์ตำแหน่งในเบราว์เซอร์ หรือเลือกจังหวัดต้นทางแทน",
  2: "หาตำแหน่งของคุณไม่ได้ในตอนนี้ ลองใหม่อีกครั้ง หรือเลือกจังหวัดต้นทางแทน",
  3: "หาตำแหน่งนานเกินไป ลองใหม่อีกครั้ง"
};

export function useNearby() {
  const [state, setState] = useState({ status: "idle", items: [], origin: null, meta: null, error: "" });
  const controllerRef = useRef(null);

  const fetchNear = useCallback(async (origin) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState((previous) => ({ ...previous, status: "loading", origin, error: "" }));
    try {
      const data = await fetchJson(`/api/gardens/near?lat=${origin.lat}&lng=${origin.lng}`, { signal: controller.signal });
      setState({ status: data.gardens.length === 0 ? "empty" : "success", items: data.gardens, origin, meta: data.meta, error: "" });
    } catch (error) {
      if (error.name === "AbortError") return;
      setState((previous) => ({ ...previous, status: "error", error: error.message }));
    }
  }, []);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState((previous) => ({ ...previous, status: "error", error: "เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง" }));
      return;
    }
    setState((previous) => ({ ...previous, status: "locating", error: "" }));
    navigator.geolocation.getCurrentPosition(
      (position) => fetchNear({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => setState((previous) => ({ ...previous, status: "error", origin: null, error: GEO_ERRORS[error.code] || GEO_ERRORS[2] })),
      { timeout: 10000, maximumAge: 60000 }
    );
  }, [fetchNear]);

  // ลองอีกครั้ง: ถ้ามีตำแหน่งแล้ว ยิงแค่ Express ซ้ำ ไม่ต้องขอ GPS ใหม่
  const retry = useCallback(() => (state.origin ? fetchNear(state.origin) : locate()), [state.origin, fetchNear, locate]);
  const clear = useCallback(() => {
    controllerRef.current?.abort();
    setState({ status: "idle", items: [], origin: null, meta: null, error: "" });
  }, []);

  // Hash Map: id สวน → ข้อมูลเส้นทางจริง  ใช้ตอนเปิดรายละเอียดสวนจากรายการหลัก (ค้นหา O(1) แทนไล่ทีละสวน)
  const byId = useMemo(() => {
    const map = new Map();
    for (const item of state.items) map.set(item.id, item);
    return map;
  }, [state.items]);

  return { ...state, byId, locate, retry, clear };
}
