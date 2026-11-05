import StatusBox from "./StatusBox.jsx";
import { formatDuration } from "../utils/format.js";

// [เพิ่มใหม่] ส่วน "สวนใกล้ฉัน": กดปุ่มเดียว → ได้สวนใกล้สุด 5 แห่งเรียงตามระยะ "ถนนจริง" (แก้ข้อแนะนำข้อ 3)
// ครบ 4 สถานะ: idle (ปุ่ม) / locating+loading / error+ลองอีกครั้ง / empty / success (รายการ)
export default function NearbySection({ nearby, onSelect }) {
  const { status, items, meta, error, locate, retry, clear } = nearby;

  return (
    <section className="nearby" aria-label="สวนใกล้ฉัน">
      <div className="nearby-heading">
        <h2>สวนใกล้คุณ</h2>
        {status === "idle" ? (
          <button type="button" className="nearby-button" onClick={locate}>📍 ใช้ตำแหน่งของฉัน</button>
        ) : (
          <button type="button" className="nearby-link" onClick={clear}>ปิด</button>
        )}
      </div>

      {status === "idle" && <p className="nearby-hint">ดูสวนที่ใกล้ที่สุดพร้อมระยะทางและเวลาเดินทางตามเส้นทางถนนจริง</p>}
      {status === "locating" && <StatusBox kind="loading" message="กำลังหาตำแหน่งของคุณ..." />}
      {status === "loading" && <StatusBox kind="loading" message="กำลังคำนวณเส้นทางถนนจริง..." />}
      {status === "error" && <StatusBox kind="error" message={error} onRetry={retry} />}
      {status === "empty" && <StatusBox kind="empty" message="ไม่พบสวนที่มีพิกัดใกล้คุณ" />}

      {status === "success" && (
        <>
          {meta?.warning && <p className="nearby-warning">{meta.warning}</p>}
          <ol className="nearby-list">
            {items.map((garden, index) => (
              <li key={garden.id}>
                <button type="button" className="nearby-item" onClick={() => onSelect(garden)}>
                  <span className="nearby-rank">{index + 1}</span>
                  <span className="nearby-name">
                    <strong>{garden.name}</strong>
                    <small>{garden.region}</small>
                  </span>
                  <span className="nearby-route">
                    {garden.routeSource === "osrm" ? (
                      <>
                        <strong>{garden.roadKm} กม.</strong>
                        <small>{formatDuration(garden.durationMin)}</small>
                      </>
                    ) : (
                      <>
                        <strong>~{garden.roadKm} กม.</strong>
                        <small>ระยะเส้นตรง</small>
                      </>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
