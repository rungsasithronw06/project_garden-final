import GardenCard from "./GardenCard.jsx";

// พื้นที่ผลการค้นหา: หัวข้อ + ข้อความสถานะ + ตารางการ์ด
// status: loading | error | success | empty — คุมว่าจะโชว์อะไรในตาราง
export default function ResultsArea({ status, gardens, statusText, onSelect, onRetry }) {
  return (
    <div className="results-area">
      <div className="results-heading">
        <h2>ผลการค้นหา</h2>
        <span id="status">{statusText}</span>
      </div>
      {/* [เพิ่มใหม่] ปุ่มลองอีกครั้งเมื่อโหลดข้อมูลไม่สำเร็จ */}
      {status === "error" && (
        <button className="clear-button" type="button" onClick={onRetry}>ลองอีกครั้ง</button>
      )}
      <div className="result-grid" aria-live="polite">
        {status !== "loading" && status !== "error" && gardens.length === 0 && (
          <div className="empty">ไม่พบสวนที่ตรงกับเงื่อนไข</div>
        )}
        {gardens.map((garden) => (
          <GardenCard key={garden.id} garden={garden} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
