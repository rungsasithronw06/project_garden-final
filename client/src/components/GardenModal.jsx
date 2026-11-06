import { useEffect } from "react";
import ImageGallery from "./ImageGallery.jsx";
import WeatherCard from "./WeatherCard.jsx";
import PlacesList from "./PlacesList.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { getGardenImages } from "../utils/gardenImages.js";
import { directionsUrl, formatDuration } from "../utils/format.js";

// หน้าต่างรายละเอียดสวน: แกลเลอรี + ยอดผู้เข้าชม + ระยะทาง/เวลา + [เพิ่มใหม่] อากาศ + สถานที่รอบสวน + ปุ่มนำทาง
// ระยะทางมี 2 แบบ: [เพิ่มใหม่] ถนนจริงจากจังหวัดต้นทาง (Express → OSRM ที่ /api/route) หรือเส้นตรง (garden.distance — ของเดิม ใช้เป็นตัวสำรอง)
export default function GardenModal({ garden, origin, onClose }) {
  const hasCoordinates = garden.lat !== null && garden.lng !== null;
  const hasStraight = garden.distance !== null && garden.distance !== Number.MAX_SAFE_INTEGER;

  // เลือกจังหวัดต้นทางแล้ว + สวนมีพิกัด → ขอเส้นทางถนนจริงจาก Express (ไม่เลือก = url เป็น null = ไม่ยิง)
  const routeUrl = origin && hasCoordinates
    ? `/api/route?fromLat=${origin.lat}&fromLng=${origin.lng}&toLat=${garden.lat}&toLng=${garden.lng}`
    : null;
  const route = useFetch(routeUrl);
  const hasRoad = route.status === "success" && route.data.source === "osrm";

  let distanceText = "ยังไม่คำนวณ";
  let distanceNote = "เลือกจังหวัดต้นทางเพื่อดูเส้นทางจริง";
  let timeText = "ยังไม่คำนวณ";
  if (route.status === "loading") {
    distanceText = "กำลังคำนวณ...";
    distanceNote = `จาก ${origin.name} ตามถนนจริง`;
    timeText = "กำลังคำนวณ...";
  } else if (hasRoad) {
    distanceText = `${route.data.distanceKm} กม.`;
    distanceNote = `จาก ${origin.name} ตามถนนจริง`;
    timeText = formatDuration(route.data.durationMin);
  } else if (hasStraight) {
    // ถนนจริงไม่ได้ (ล่ม/หาเส้นทางไม่เจอ) หรือยังไม่ได้เรียก → ใช้เส้นตรงแทนและบอกชัดว่าเป็นค่าประมาณ
    distanceText = `${garden.distance.toFixed(1)} กม.`;
    distanceNote = route.status === "error" || route.status === "success" ? "เส้นตรง (ประมาณ) — คำนวณถนนจริงไม่ได้" : "เส้นตรง (ประมาณ)";
    // เวลาโดยประมาณ = ระยะเส้นตรง ÷ 60 กม./ชม. (ตรรกะเดิม)
    timeText = `${Math.ceil(garden.distance / 60)} ชม. โดยประมาณ`;
  }

  // [เพิ่มใหม่ — UX] กด Esc เพื่อปิดหน้าต่างรายละเอียด
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal is-open"
      role="dialog"
      aria-modal="true"
      aria-label="รายละเอียดสวน"
      onClick={(event) => {
        // กดพื้นหลังมืดเพื่อปิด
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <article className="detail-card">
        <button className="close-modal" type="button" aria-label="ปิดรายละเอียด" onClick={onClose}>×</button>
        <ImageGallery images={getGardenImages(garden)} gardenName={garden.name} />
        <div>
          <h2>{garden.name}</h2>
          <p>{garden.region} · {garden.address || "ไม่ระบุที่อยู่"}</p>
          <div className="detail-metrics">
            <div className="detail-metric">
              <span>ผู้เข้าชม ปี 67</span>
              <strong>{garden.visitors.toLocaleString("th-TH")} คน</strong>
            </div>
            <div className="detail-metric">
              <span>ระยะทาง</span>
              <strong>{distanceText}</strong>
              <small>{distanceNote}</small>
            </div>
            <div className="detail-metric">
              <span>เดินทางโดยรถยนต์</span>
              <strong>{timeText}</strong>
            </div>
          </div>
        </div>
        {/* [แก้ไข UX] ปุ่มนำทางย้ายออกมาเป็นแถบ: PC อยู่ใต้ตัวเลข / มือถือเป็นแถบติดล่างของหน้าต่าง (จัดตำแหน่งด้วย CSS) */}
        {hasCoordinates && (
          <div className="directions-bar">
            <a className="directions-button" href={directionsUrl(garden, origin)} target="_blank" rel="noreferrer">
              🧭 นำทางด้วย Google Maps
            </a>
          </div>
        )}
        {/* [แก้ไข UX] PC: สภาพอากาศกับสถานที่รอบสวนวางคู่กัน 2 คอลัมน์ จะได้ไม่ต้องเลื่อนยาว */}
        <div className="detail-extras">
          <WeatherCard garden={garden} />
          <PlacesList garden={garden} />
        </div>
      </article>
    </div>
  );
}
