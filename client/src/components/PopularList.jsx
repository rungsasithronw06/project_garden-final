import { useMemo } from "react";
import { mergeSort, takeFirst } from "../utils/dsa/mergeSort.js";
import { getGardenImages } from "../utils/gardenImages.js";

// [เพิ่มใหม่ — UX] สวนยอดนิยม 3 อันดับแรก แสดงใต้แผงค้นหาบนจอใหญ่ (ซ่อนบนมือถือ ที่ยังใช้สไลด์ FeaturedCarousel เหมือนเดิม)
// ข้อมูลและวิธีจัดอันดับเหมือน FeaturedCarousel: Merge Sort ตามยอดผู้เข้าชมมาก→น้อย แล้วหยิบตัวแรก ๆ
export default function PopularList({ gardens, sourceText, onSelect }) {
  const topThree = useMemo(() => takeFirst(mergeSort(gardens, "visitors", true), 3), [gardens]);

  return (
    <section className="popular" aria-label="สวนยอดนิยม">
      <h2>สวนยอดนิยมจากสถิติผู้เข้าชม ปี 67</h2>
      <p className="popular-note">{sourceText}</p>
      {topThree.length === 0 ? (
        <p className="popular-note">กำลังรอข้อมูลสวนยอดนิยม</p>
      ) : (
        <ol>
          {topThree.map((garden, index) => {
            const image = getGardenImages(garden)[0];
            return (
              <li key={garden.id}>
                <button className="popular-item" type="button" onClick={() => onSelect(garden)}>
                  <b>{index + 1}</b>
                  {image ? <img className="popular-thumb" src={image.src} alt="" /> : <span className="popular-thumb" />}
                  <span className="popular-name">
                    {garden.name}
                    <small>{garden.visitors.toLocaleString("th-TH")} คน</small>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
