import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "../utils/api.js";

// ดึงรายการสวนจาก Express (/api/gardens) แทนการเรียก data.go.th ตรง ๆ แบบโปรเจกต์เดิม
// status: loading | success | empty | error  (ครบ 4 สถานะที่อาจารย์ต้องการ)
export function useGardens() {
  const [state, setState] = useState({ status: "loading", gardens: [], meta: null, error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => ({ ...previous, status: "loading", error: "" }));

    fetchJson("/api/gardens", { signal: controller.signal })
      .then((data) => {
        // ปรับรูปแบบให้เหมือนโปรเจกต์เดิม: ไม่มียอดผู้เข้าชม = 0 และมีช่อง distance ไว้เก็บระยะทาง
        const gardens = data.gardens.map((garden) => ({ ...garden, visitors: garden.visitors || 0, distance: null }));
        setState({ status: gardens.length === 0 ? "empty" : "success", gardens, meta: data.meta, error: "" });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", gardens: [], meta: null, error: error.message });
      });

    return () => controller.abort();
  }, [attempt]);

  // [เพิ่มใหม่] ปุ่ม "ลองอีกครั้ง" เมื่อโหลดไม่สำเร็จ
  const retry = useCallback(() => setAttempt((count) => count + 1), []);
  return { ...state, retry };
}
