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
// [เพิ่มใหม่] เพิ่ม "น้อยไปมาก" (ข้อ 3)
const POPULAR_OPTIONS = [
  { value: "none", label: "แสดงทั้งหมด" },
  { value: "popular", label: "ยอดผู้เข้าชมมากที่สุด" },
  { value: "popularAsc", label: "ยอดผู้เข้าชมน้อยที่สุด" }
];
// รายชื่อจังหวัดสร้างจากข้อมูลพิกัดจังหวัดเดิม
const PROVINCE_OPTIONS = [{ value: "", label: "เลือกจังหวัดต้นทาง" }];
for (const provinceName in provinceCoordinates) PROVINCE_OPTIONS.push({ value: provinceName, label: provinceName });

// แผงเครื่องมือค้นหาด้านซ้าย
// [แก้ไขตามข้อแนะนำข้อ 1 — มือถือ] เดิมแผงนี้ยาวมากจนผลลัพธ์ถูกดันลงไปท้ายจอ
//   ตอนนี้บนจอเล็กจะเหลือแค่ช่องค้นหา + ปุ่ม "ตัวกรอง" (พับเก็บไว้) และผลลัพธ์ขึ้นมาอยู่ถัดลงมาทันที
// [แก้ไขตามข้อ 4 UX] ตัวกรองมีผลทันทีที่เลือก ไม่ต้องกด "ยืนยัน" อีกขั้น — ปุ่มล่างเปลี่ยนเป็น "ดูผลลัพธ์" (พับแผง + เลื่อนไปที่ผลลัพธ์)
export default function SearchPanel({ query, onQueryChange, gardens, filters, onFilterChange, resultCount, onShowResults, onReset }) {
  const [open, setOpen] = useState(false); // ใช้เฉพาะจอเล็ก (จอใหญ่แสดงตัวกรองเสมอ)

  return (
    <aside className="panel" aria-label="เครื่องมือค้นหา">
      <div className="panel-inner">
        <h2 className="section-label">ค้นหาสวนพฤกษศาสตร์</h2>
        <SearchBox query={query} onQueryChange={onQueryChange} gardens={gardens} />
        <button className="filter-toggle" type="button" aria-expanded={open} aria-controls="filters" onClick={() => setOpen(!open)}>
          {open ? "ซ่อนตัวกรอง ▲" : "ตัวกรองและการเรียง ▼"}
        </button>
        <div id="filters" className={`filters${open ? " is-open" : ""}`}>
          <SelectField id="regionSelect" label="ภูมิภาค" value={filters.region} onChange={(value) => onFilterChange({ region: value })} options={REGION_OPTIONS} />
          <SelectField id="popularSelect" label="เรียงตามความนิยม" value={filters.popular} onChange={(value) => onFilterChange({ popular: value })} options={POPULAR_OPTIONS} />
          <SelectField id="referenceSelect" label="คำนวณระยะทางจากจังหวัด" value={filters.province} onChange={(value) => onFilterChange({ province: value })} options={PROVINCE_OPTIONS} />
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              setOpen(false);
              onShowResults();
            }}
          >
            ดูผลลัพธ์ ({resultCount} สวน)
          </button>
        </div>
        <div className="map-block">
          <div className="map-art">
            <img src="/assets/images/thailand-map.jpg" alt="แผนที่ประเทศไทย" />
          </div>
          <button className="clear-button" type="button" onClick={onReset}>ล้างผลการค้นหา</button>
        </div>
      </div>
    </aside>
  );
}
