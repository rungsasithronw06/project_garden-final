import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "../utils/api.js";

// [เพิ่มใหม่] hook ดึงข้อมูลทั่วไป ใช้กับสภาพอากาศและสถานที่รอบสวน
// status: idle (url เป็น null) | loading | success | error — component ที่ใช้ต้องจัดการให้ครบทุกสถานะ
export function useFetch(url) {
  const [state, setState] = useState({ status: url ? "loading" : "idle", data: null, error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!url) {
      setState({ status: "idle", data: null, error: "" });
      return undefined;
    }
    // AbortController: ปิดโมดัลหรือเปลี่ยนสวนกลางทาง → ยกเลิกคำขอเก่า กันข้อมูลของสวนก่อนหน้ามาแสดงทับ
    const controller = new AbortController();
    setState({ status: "loading", data: null, error: "" });
    fetchJson(url, { signal: controller.signal })
      .then((data) => setState({ status: "success", data, error: "" }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", data: null, error: error.message });
      });
    return () => controller.abort();
  }, [url, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);
  return { ...state, retry };
}
