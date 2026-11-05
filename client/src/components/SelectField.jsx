// dropdown พร้อมป้ายกำกับ ใช้ซ้ำ 3 ช่อง (ภูมิภาค / ความนิยม / จังหวัดต้นทาง)
export default function SelectField({ id, label, value, onChange, options }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
