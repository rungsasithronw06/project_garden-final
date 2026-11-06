import GardenCard from "./GardenCard.jsx";
import ActiveFilters from "./ActiveFilters.jsx";

// พื้นที่ผลการค้นหา: หัวข้อ + ข้อความสถานะ + [ย้ายมา] เรียงตาม + [เพิ่มใหม่] ชิปตัวกรอง + ตารางการ์ด
// status: loading | error | success | empty — คุมว่าจะโชว์อะไรในตาราง
export default function ResultsArea({ status, gardens, statusText, filters, onFilterChange, onSelect, onRetry }) {
  // เลือกจังหวัดต้นทางแล้ว ระบบเรียงใกล้→ไกลเป็นค่าเริ่มต้น (ตรรกะใน App.jsx) จึงบอกให้ชัดในตัวเลือกแรก
  const defaultLabel = filters.province ? "ใกล้ → ไกล (ค่าเริ่มต้น)" : "ค่าเริ่มต้น";
  return (
    <div className="results-area">
      <div className="results-heading">
        <div className="results-title">
          <h2>ผลการค้นหา</h2>
          <span id="status">{statusText}</span>
        </div>
        <div className="sort-field">
          <label htmlFor="sortSelect">เรียงตาม</label>
          <select id="sortSelect" value={filters.popular} onChange={(event) => onFilterChange({ popular: event.target.value })}>
            <option value="none">{defaultLabel}</option>
            <option value="popular">นิยมมาก → น้อย</option>
            <option value="popularAsc">นิยมน้อย → มาก</option>
          </select>
        </div>
      </div>
      <ActiveFilters filters={filters} onFilterChange={onFilterChange} />
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
