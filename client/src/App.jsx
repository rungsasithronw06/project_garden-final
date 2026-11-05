import { useMemo, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import SearchPanel from "./components/SearchPanel.jsx";
import FeaturedCarousel from "./components/FeaturedCarousel.jsx";
import ResultsArea from "./components/ResultsArea.jsx";
import GardenModal from "./components/GardenModal.jsx";
import { useGardens } from "./hooks/useGardens.js";
import { provinceCoordinates } from "./data/provinces.js";
import { haversine } from "./utils/geo.js";
import { searchGardens } from "./utils/dsa/fuzzySearch.js";
import { filterByRegion } from "./utils/dsa/filter.js";
import { mergeSort } from "./utils/dsa/mergeSort.js";
import { sortByPopularity } from "./utils/dsa/popularity.js";

// ค่าเริ่มต้นของตัวกรอง (ใช้ตอนเปิดเว็บและตอนกด "ล้างผลการค้นหา")
const DEFAULT_FILTERS = { region: "ทั้งหมด", popular: "none", province: "" };

export default function App() {
  // query เปลี่ยนทันทีที่พิมพ์ (เหมือนเดิม)
  const [query, setQuery] = useState("");
  // [แก้ไข] เดิมมี draft (ที่เลือก) กับ applied (ที่กดยืนยัน) ต้องกดยืนยันอีกขั้น → ตอนนี้ตัวกรองมีผลทันที เหลือ state เดียว
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selected, setSelected] = useState(null);
  const resultsRef = useRef(null);

  const { status, gardens, meta, retry } = useGardens();

  // คำนวณระยะทางจากจังหวัดต้นทางที่เลือก (ตรรกะเดิม: ไม่มีพิกัดสวน = ค่ามากสุดเพื่อให้ไปท้ายแถว)
  const gardensWithDistance = useMemo(() => {
    const province = provinceCoordinates[filters.province];
    return gardens.map((garden) => {
      if (!province) return { ...garden, distance: null };
      const noCoordinates = garden.lat === null || garden.lng === null;
      return { ...garden, distance: noCoordinates ? Number.MAX_SAFE_INTEGER : haversine(province.lat, province.lng, garden.lat, garden.lng) };
    });
  }, [gardens, filters.province]);

  // ลำดับการทำงาน: ค้นหา → กรองภาค → เรียงลำดับ
  const results = useMemo(() => {
    let result = searchGardens(gardensWithDistance, query); // [เพิ่มใหม่] พิมพ์ผิดก็ยังเจอ
    result = filterByRegion(result, filters.region);
    if (filters.province) {
      // เลือกจังหวัดแล้วเรียงใกล้→ไกล ถ้าเลือกเรียงตามความนิยมด้วยให้ใช้ยอดผู้เข้าชมตัดสินเมื่อระยะเท่ากัน
      if (filters.popular === "popular") result = mergeSort(result, "distance", false, "visitors", true);
      else if (filters.popular === "popularAsc") result = mergeSort(result, "distance", false, "visitors", false); // [เพิ่มใหม่]
      else result = mergeSort(result, "distance", false);
    } else {
      result = sortByPopularity(result, filters.popular); // มาก→น้อย (เดิม) และ น้อย→มาก [เพิ่มใหม่]
    }
    return result;
  }, [gardensWithDistance, query, filters]);

  // Hash Map: id → สวน (ใช้ตอนเปิดรายละเอียด ให้ได้ข้อมูลรูปแบบเดียวกันไม่ว่ากดมาจากหน้าไหน)
  const gardenById = useMemo(() => {
    const map = new Map();
    for (const garden of gardensWithDistance) map.set(garden.id, garden);
    return map;
  }, [gardensWithDistance]);

  // เปิดรายละเอียดสวน (ใช้ข้อมูลจาก Hash Map ให้เหมือนกันไม่ว่ากดมาจากหน้าไหน)
  const handleSelect = (garden) => setSelected(gardenById.get(garden.id) ?? garden);

  // [แก้ไข] จุดต้นทางของ "เส้นทางถนนจริง" = จังหวัดต้นทางที่ผู้ใช้เลือก (ไม่มีก็ไม่คำนวณ)
  const origin = provinceCoordinates[filters.province] ? { name: filters.province, ...provinceCoordinates[filters.province] } : null;

  // ข้อความสถานะในหัวข้อ "ผลการค้นหา"
  let statusText = `พบ ${results.length} สวน`;
  if (status === "loading") statusText = "กำลังโหลดข้อมูล...";
  else if (status === "error") statusText = "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่";
  else if (results.length === 0) statusText = "ไม่มีผลลัพธ์ที่ตรงกับเงื่อนไข";

  // สถานะ empty ครอบคลุมทั้งกรณี API ไม่มีสวน และกรณีค้นหา/กรองแล้วไม่เจอ
  const viewStatus = status === "success" && results.length === 0 ? "empty" : status;

  let sourceText = meta?.warning || "ข้อมูลล่าสุดจาก data.go.th";
  if (status === "loading") sourceText = "กำลังโหลด...";
  else if (status === "error") sourceText = "โหลดข้อมูลไม่สำเร็จ";

  // ล้างทุกอย่างกลับค่าเริ่มต้น
  const handleReset = () => {
    setQuery("");
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <>
      <Header />
      <main>
        <div className="layout">
          <SearchPanel
            query={query}
            onQueryChange={setQuery}
            gardens={gardensWithDistance}
            filters={filters}
            onFilterChange={(change) => setFilters((previous) => ({ ...previous, ...change }))}
            resultCount={results.length}
            onShowResults={() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            onReset={handleReset}
          />
          <section className="right-panel" aria-label="ผลลัพธ์และสวนยอดนิยม">
            <FeaturedCarousel gardens={gardens} sourceText={sourceText} onSelect={handleSelect} />
            <div className="results-wrap" ref={resultsRef}>
              <ResultsArea status={viewStatus} gardens={results} statusText={statusText} onSelect={handleSelect} onRetry={retry} />
            </div>
          </section>
        </div>
      </main>
      {selected && <GardenModal garden={selected} origin={origin} onClose={() => setSelected(null)} />}
    </>
  );
}
