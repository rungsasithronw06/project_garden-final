import ImageSlot from "./ImageSlot.jsx";
import { getGardenImages } from "../utils/gardenImages.js";

// การ์ดผลลัพธ์ 1 ใบ: กดหรือกด Enter เพื่อเปิดรายละเอียด (เหมือนเดิม)
export default function GardenCard({ garden, onSelect }) {
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
      </div>
    </article>
  );
}
