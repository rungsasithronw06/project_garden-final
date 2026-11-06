// [เพิ่มใหม่ — UX] ชิปบอกตัวกรองที่ใช้อยู่ กด × เพื่อเอาตัวกรองนั้นออก (ใช้ state filters เดิม ไม่มีตรรกะใหม่)
const POPULAR_LABELS = { popular: "นิยมมาก → น้อย", popularAsc: "นิยมน้อย → มาก" };

export default function ActiveFilters({ filters, onFilterChange }) {
  const chips = [];
  if (filters.region !== "ทั้งหมด") chips.push({ key: "region", label: filters.region, clear: { region: "ทั้งหมด" } });
  if (filters.province) chips.push({ key: "province", label: `ระยะทางจาก ${filters.province}`, clear: { province: "" } });
  if (POPULAR_LABELS[filters.popular]) chips.push({ key: "popular", label: POPULAR_LABELS[filters.popular], clear: { popular: "none" } });
  if (chips.length === 0) return null;

  return (
    <ul className="active-filters" aria-label="ตัวกรองที่ใช้อยู่">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button className="chip" type="button" aria-label={`เอาตัวกรอง ${chip.label} ออก`} onClick={() => onFilterChange(chip.clear)}>
            {chip.label} <span aria-hidden="true">×</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
