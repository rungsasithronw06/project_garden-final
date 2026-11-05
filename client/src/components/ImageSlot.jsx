// กรอบรูปที่ใช้ซ้ำทั้งในสไลด์และการ์ดผลลัพธ์: มีรูปก็แสดงรูป ไม่มีก็แสดงข้อความแทน
export default function ImageSlot({ image, alt, emptyLabel }) {
  if (image) {
    return (
      <div className="image-slot has-image">
        <img src={image.src} alt={alt} />
      </div>
    );
  }
  return (
    <div className="image-slot">
      <div>
        <strong>ยังไม่มีภาพสวน</strong>
        <span>{emptyLabel}</span>
      </div>
    </div>
  );
}
