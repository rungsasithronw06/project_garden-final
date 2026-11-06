import GardenCard from "./GardenCard.jsx";
import ActiveFilters from "./ActiveFilters.jsx";
import StatusBox from "./StatusBox.jsx";

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
      <div className="result-grid" aria-live="polite">
        {/* [แก้ไข] ครบ 4 สถานะด้วย StatusBox ตัวเดียวกับอากาศ/สถานที่: loading (วงกลมหมุน) / error (+ลองอีกครั้ง) / empty / success (การ์ด) */}
        {status === "loading" && <StatusBox kind="loading" message="กำลังโหลดรายการสวน..." />}
        {status === "error" && <StatusBox kind="error" message="โหลดรายการสวนไม่สำเร็จ" onRetry={onRetry} />}
        {status === "empty" && <StatusBox kind="empty" message={'ไม่พบสวนที่ตรงกับเงื่อนไข ลองเปลี่ยนคำค้นหาหรือกด "ล้างทั้งหมด"'} />}
        {gardens.map((garden) => (
          <GardenCard key={garden.id} garden={garden} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
