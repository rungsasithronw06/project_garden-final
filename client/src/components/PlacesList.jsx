import { useFetch } from "../hooks/useFetch.js";
import StatusBox from "./StatusBox.jsx";
import { placeUrl } from "../utils/format.js";

// [เพิ่มใหม่] สถานที่รอบสวน (ข้อ 5): ร้านอาหาร/คาเฟ่ ที่พัก ที่เที่ยว ปั๊มน้ำมัน เรียงจากใกล้ไปไกล
// ข้อมูลจาก OpenStreetMap ผ่าน Express (/api/gardens/:id/places)
export default function PlacesList({ garden }) {
  const hasCoordinates = garden.lat !== null && garden.lng !== null;
  const { status, data, error, retry } = useFetch(hasCoordinates ? `/api/gardens/${encodeURIComponent(garden.id)}/places` : null);

  return (
    <section className="extra-card" aria-label="สถานที่รอบสวน">
      <h3>สถานที่รอบสวน</h3>
      {!hasCoordinates && <StatusBox kind="empty" message="สวนนี้ไม่มีพิกัด จึงหาสถานที่รอบสวนไม่ได้" />}
      {status === "loading" && <StatusBox kind="loading" message="กำลังค้นหาสถานที่รอบสวน..." />}
      {status === "error" && <StatusBox kind="error" message={error} onRetry={retry} />}
      {status === "success" && data.total === 0 && (
        <StatusBox kind="empty" message={`ไม่พบสถานที่ในรัศมี ${data.radiusKm} กม. (ข้อมูลแผนที่ในพื้นที่ห่างไกลอาจยังไม่ครบ)`} />
      )}
      {status === "success" && data.total > 0 && (
        <>
          {data.groups.filter((group) => group.items.length > 0).map((group) => (
            <div key={group.key} className="places-group">
              <h4>{group.label}</h4>
              <ul>
                {group.items.map((place) => (
                  <li key={`${place.name}-${place.lat}`}>
                    <a href={placeUrl(place)} target="_blank" rel="noreferrer">{place.name}</a>
                    <small>~{place.distanceKm} กม.</small>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <small className="credit">
            รัศมี {data.radiusKm} กม. (ระยะเส้นตรง) · ข้อมูลจาก © OpenStreetMap contributors{data.stale ? " (ข้อมูลล่าสุดที่มี)" : ""}
          </small>
        </>
      )}
    </section>
  );
}
