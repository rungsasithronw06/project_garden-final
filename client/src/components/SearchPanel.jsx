import { useState } from "react";
import SearchBox from "./SearchBox.jsx";
import SelectField from "./SelectField.jsx";
import { provinceCoordinates } from "../data/provinces.js";

const REGION_OPTIONS = [
  { value: "ทั้งหมด", label: "ทุกภูมิภาค" },
  { value: "ภาคเหนือ", label: "ภาคเหนือ" },
  { value: "ภาคกลาง", label: "ภาคกลาง" },
  { value: "ภาคตะวันออกเฉียงเหนือ", label: "ภาคตะวันออกเฉียงเหนือ" },
  { value: "ภาคใต้", label: "ภาคใต้" },
  { value: "ภาคตะวันตก", label: "ภาคตะวันตก" }
];
// รายชื่อจังหวัดสร้างจากข้อมูลพิกัดจังหวัดเดิม
const PROVINCE_OPTIONS = [{ value: "", label: "เลือกจังหวัดต้นทาง" }];
for (const provinceName in provinceCoordinates) PROVINCE_OPTIONS.push({ value: provinceName, label: provinceName });

// แผงเครื่องมือค้นหา
// [แก้ไข UX] จอใหญ่: แผงอยู่ซ้ายแบบติดจอ ตัวกรองมีผลทันที (ไม่มีปุ่มยืนยัน) ท้ายแผงบอกจำนวนผลลัพธ์ + ปุ่มล้างทั้งหมด
//             จอเล็ก (≤ 850px): เหลือช่องค้นหา + ปุ่ม "ตัวกรอง (n)" กดแล้วเปิดเป็น bottom sheet มีปุ่ม "ดูผลลัพธ์" ปิด sheet แล้วเลื่อนไปที่ผลลัพธ์
// [ย้าย] ตัวเลือก "เรียงตาม" ไปอยู่ที่หัวผลลัพธ์ (ResultsArea.jsx) — ใช้ state filters.popular ตัวเดิม
// [เอาออก] รูปแผนที่ประเทศไทย (ไฟล์รูปยังอยู่ใน public/assets/images ไม่ได้ลบ)
export default function SearchPanel({ query, onQueryChange, gardens, filters, onFilterChange, statusText, resultLabel, onShowResults, onReset }) {
  const [open, setOpen] = useState(false); // ใช้เฉพาะจอเล็ก (จอใหญ่แสดงตัวกรองเสมอ)
  const activeCount = (filters.region !== "ทั้งหมด" ? 1 : 0) + (filters.province ? 1 : 0);

  return (
    <aside className="panel" aria-label="เครื่องมือค้นหา">
      <div className="panel-inner">
        <h2 className="section-label">ค้นหาสวนพฤกษศาสตร์</h2>
        <div className="search-row">
          <SearchBox query={query} onQueryChange={onQueryChange} gardens={gardens} />
          <button className="filter-toggle" type="button" aria-expanded={open} aria-controls="filters" onClick={() => setOpen(true)}>
            ตัวกรอง{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
        </div>
        {open && <div className="sheet-backdrop" onClick={() => setOpen(false)} />}
        <div id="filters" className={`filters${open ? " is-open" : ""}`}>
          <div className="sheet-head">
            <h3>ตัวกรอง</h3>
            <button className="sheet-close" type="button" aria-label="ปิดตัวกรอง" onClick={() => setOpen(false)}>×</button>
          </div>
          <SelectField id="regionSelect" label="ภูมิภาค" value={filters.region} onChange={(value) => onFilterChange({ region: value })} options={REGION_OPTIONS} />
          <SelectField id="referenceSelect" label="คำนวณระยะทางจากจังหวัด" value={filters.province} onChange={(value) => onFilterChange({ province: value })} options={PROVINCE_OPTIONS} />
          <p className="field-hint">เลือกจังหวัดแล้ว สวนจะเรียงจากใกล้ไปไกลให้อัตโนมัติ</p>
          <button
            className="primary-button sheet-only"
            type="button"
            onClick={() => {
              setOpen(false);
              onShowResults();
            }}
          >
            {resultLabel ? `ดูผลลัพธ์ (${resultLabel})` : "ดูผลลัพธ์"}
          </button>
          <button className="link-button sheet-only" type="button" onClick={onReset}>ล้างทั้งหมด</button>
        </div>
        <div className="panel-footer">
          <span>{statusText}</span>
          <button className="link-button" type="button" onClick={onReset}>ล้างทั้งหมด</button>
        </div>
      </div>
    </aside>
  );
}
