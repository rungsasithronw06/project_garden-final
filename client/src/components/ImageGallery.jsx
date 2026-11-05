import { useState } from "react";

// แกลเลอรีรูปในหน้ารายละเอียด: ปุ่มก่อนหน้า/ถัดไป (ปิดเมื่อถึงรูปแรก/สุดท้าย) และตัวนับภาพ
export default function ImageGallery({ images, gardenName }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="detail-gallery" aria-live="polite">
        <div className="gallery-empty">ยังไม่มีภาพสำหรับสวนนี้</div>
      </div>
    );
  }
  const image = images[index];
  return (
    <div className="detail-gallery" aria-live="polite">
      <img src={image.src} alt={`${gardenName} ภาพ ${image.number}`} />
      {images.length > 1 && (
        <>
          <button className="gallery-control gallery-previous" type="button" aria-label="ภาพก่อนหน้า" disabled={index === 0} onClick={() => setIndex(index - 1)}>
            &#8249;
          </button>
          <button className="gallery-control gallery-next" type="button" aria-label="ภาพถัดไป" disabled={index === images.length - 1} onClick={() => setIndex(index + 1)}>
            &#8250;
          </button>
        </>
      )}
      <span className="gallery-counter">
        ภาพ {image.number} · {index + 1}/{images.length}
      </span>
    </div>
  );
}
