import { useFetch } from "../hooks/useFetch.js";
import StatusBox from "./StatusBox.jsx";

const WEEKDAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
function dayLabel(dateText, index) {
  if (index === 0) return "วันนี้";
  // ใส่เวลาเที่ยงกันวันเลื่อนจากเขตเวลา
  return WEEKDAYS[new Date(`${dateText}T12:00:00`).getDay()];
}

// [เพิ่มใหม่] สภาพอากาศ ณ สวน (ข้อ 6) — ข้อมูลที่ผ่านการแปลงแล้วจาก Express (/api/gardens/:id/weather)
export default function WeatherCard({ garden }) {
  const hasCoordinates = garden.lat !== null && garden.lng !== null;
  const { status, data, error, retry } = useFetch(hasCoordinates ? `/api/gardens/${encodeURIComponent(garden.id)}/weather` : null);

  return (
    <section className="extra-card" aria-label="สภาพอากาศ">
      <h3>สภาพอากาศที่สวน</h3>
      {!hasCoordinates && <StatusBox kind="empty" message="สวนนี้ไม่มีพิกัด จึงดูสภาพอากาศไม่ได้" />}
      {status === "loading" && <StatusBox kind="loading" message="กำลังโหลดสภาพอากาศ..." />}
      {status === "error" && <StatusBox kind="error" message={error} onRetry={retry} />}
      {status === "success" && (
        <>
          <div className="weather-now">
            <span className="weather-icon" aria-hidden="true">{data.current.icon}</span>
            <div>
              <strong>{data.current.tempC}°C</strong>
              <span>{data.current.text}</span>
            </div>
            <ul className="weather-facts">
              <li>รู้สึกเหมือน {data.current.feelsLikeC}°C</li>
              <li>ความชื้น {data.current.humidity}%</li>
              <li>ลม {data.current.windKmh} กม./ชม.</li>
            </ul>
          </div>
          <p className="weather-advice">{data.advice}</p>
          <ul className="weather-days">
            {data.daily.map((day, index) => (
              <li key={day.date}>
                <span>{dayLabel(day.date, index)}</span>
                <span aria-hidden="true">{day.icon}</span>
                <span>{day.minC}–{day.maxC}°</span>
                <small>ฝน {day.rainChance}%</small>
              </li>
            ))}
          </ul>
          <small className="credit">ข้อมูลจาก Open-Meteo{data.stale ? " (ข้อมูลล่าสุดที่มี อาจไม่เป็นปัจจุบัน)" : ""}</small>
        </>
      )}
    </section>
  );
}
