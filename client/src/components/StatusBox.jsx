// [เพิ่มใหม่] กล่องแสดงสถานะที่ใช้ซ้ำทุกจุดที่ดึงข้อมูล: loading / empty / error (success คือตัวข้อมูลเอง)
export default function StatusBox({ kind, message, onRetry }) {
  return (
    <div className={`status-box status-${kind}`} role={kind === "error" ? "alert" : "status"}>
      {kind === "loading" && <span className="spinner" aria-hidden="true" />}
      <span>{message}</span>
      {kind === "error" && onRetry && (
        <button type="button" className="retry-button" onClick={onRetry}>ลองอีกครั้ง</button>
      )}
    </div>
  );
}
