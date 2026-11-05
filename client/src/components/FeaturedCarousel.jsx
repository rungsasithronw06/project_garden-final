import { useEffect, useMemo, useState } from "react";
import ImageSlot from "./ImageSlot.jsx";
import { mergeSort, takeFirst } from "../utils/dsa/mergeSort.js";
import { getGardenImages } from "../utils/gardenImages.js";

// สไลด์ 5 สวนที่มียอดผู้เข้าชมสูงสุด เปลี่ยนอัตโนมัติทุก 4 วินาที (พฤติกรรมเดิม)
export default function FeaturedCarousel({ gardens, sourceText, onSelect }) {
  const [index, setIndex] = useState(0);

  // เรียงตามยอดผู้เข้าชมมาก→น้อยด้วย Merge Sort เดิม แล้วหยิบ 5 อันดับแรก
  const topFive = useMemo(() => takeFirst(mergeSort(gardens, "visitors", true), 5), [gardens]);

  // ตั้งเวลาเปลี่ยนสไลด์ — สร้างใหม่ทุกครั้งที่ index เปลี่ยน จึงเริ่มนับ 4 วินาทีใหม่เมื่อผู้ใช้กดจุด (เหมือนเดิม)
  useEffect(() => {
    if (topFive.length === 0) return undefined;
    const timer = setInterval(() => setIndex((current) => (current + 1) % topFive.length), 4000);
    return () => clearInterval(timer);
  }, [topFive.length, index]);

  return (
    <div className="feature">
      <div className="feature-heading">
        <span>สวนยอดนิยมจากสถิติผู้เข้าชม ปี 67</span>
        <span id="sourceStatus">{sourceText}</span>
      </div>
      <div>
        {topFive.length === 0 ? (
          <div className="slide active">
            <div className="image-slot">กำลังรอข้อมูลสวนยอดนิยม</div>
          </div>
        ) : (
          topFive.map((garden, slideIndex) => (
            <div key={garden.id} className={`slide${slideIndex === index ? " active" : ""}`} onClick={() => onSelect(garden)}>
              <ImageSlot image={getGardenImages(garden)[0]} alt={garden.name} emptyLabel={`อันดับ ${slideIndex + 1}`} />
              <div className="slide-caption">
                <strong>{garden.name}</strong>
                <span>{garden.visitors.toLocaleString("th-TH")} คน</span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="dots">
        {topFive.map((garden, dotIndex) => (
          <button
            key={garden.id}
            type="button"
            className={`dot${dotIndex === index ? " active" : ""}`}
            aria-label={`แสดงอันดับ ${dotIndex + 1}`}
            onClick={() => setIndex(dotIndex)}
          />
        ))}
      </div>
    </div>
  );
}
