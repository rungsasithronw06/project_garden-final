import ImageSlot from "./ImageSlot.jsx";
import { getGardenImages } from "../utils/gardenImages.js";

// การ์ดผลลัพธ์ 1 ใบ: กดหรือกด Enter เพื่อเปิดรายละเอียด (เหมือนเดิม)
// [แก้ไข UX] ชื่อขึ้นได้ 2 บรรทัด + บอกยอดผู้เข้าชม + ระยะทาง (เมื่อเลือกจังหวัดต้นทาง) ให้เห็นโดยไม่ต้องเปิดการ์ด
export default function GardenCard({ garden, onSelect }) {
  const hasDistance = garden.distance !== null && garden.distance !== Number.MAX_SAFE_INTEGER;
  const noCoordinates = garden.distance === Number.MAX_SAFE_INTEGER; // เลือกจังหวัดแล้วแต่สวนนี้ไม่มีพิกัด
  return (
    <article
      className="result-card"
      tabIndex={0}
      onClick={() => onSelect(garden)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onSelect(garden);
      }}
    >
      <ImageSlot image={getGardenImages(garden)[0]} alt={garden.name} emptyLabel={garden.name} />
      <div className="result-info">
        <h3>{garden.name}</h3>
        <p>{garden.region}</p>
        <div className="result-meta">
          <span>{garden.visitors > 0 ? `${garden.visitors.toLocaleString("th-TH")} คน · ปี 67` : "ยังไม่มีข้อมูลผู้เข้าชม"}</span>
          {hasDistance && <span className="pill" title="ระยะเส้นตรงโดยประมาณ จากจังหวัดต้นทาง">~{Math.round(garden.distance).toLocaleString("th-TH")} กม. เส้นตรง</span>}
          {noCoordinates && <span className="pill">ไม่มีพิกัด</span>}
        </div>
      </div>
    </article>
  );
}
