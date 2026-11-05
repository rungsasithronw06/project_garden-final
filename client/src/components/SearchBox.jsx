import { useMemo, useState } from "react";
import { searchGardens } from "../utils/dsa/fuzzySearch.js";
import { takeFirst } from "../utils/dsa/mergeSort.js";

// ช่องค้นหา + รายการแนะนำชื่อสวน (แสดงสูงสุด 5 รายการ ตามของเดิม)
// [เพิ่มใหม่] ใช้ searchGardens (พิมพ์ผิดก็ยังเจอ) แทน linearSearch เดิม
export default function SearchBox({ query, onQueryChange, gardens }) {
  // open = ผู้ใช้เพิ่งพิมพ์ จึงเปิดรายการแนะนำ (ปิดเมื่อเลือกชื่อหรือกด Enter)
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    if (query.trim() === "") return [];
    return takeFirst(searchGardens(gardens, query), 5);
  }, [gardens, query]);

  return (
    <div className="search-wrap">
      <input
        type="search"
        autoComplete="off"
        placeholder="พิมพ์ชื่อสวนที่ต้องการค้นหา..."
        aria-label="ค้นหาชื่อสวน"
        value={query}
        onChange={(event) => {
          onQueryChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") setOpen(false);
        }}
      />
      <span className="search-icon">⌕</span>
      <div className={`suggestions${open && suggestions.length > 0 ? " is-visible" : ""}`}>
        {suggestions.map((garden) => (
          <button
            key={garden.id}
            type="button"
            className="suggestion"
            onClick={() => {
              onQueryChange(garden.name);
              setOpen(false);
            }}
          >
            {garden.name}
          </button>
        ))}
      </div>
    </div>
  );
}
