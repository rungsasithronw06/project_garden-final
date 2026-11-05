// ส่วนหัวเว็บ (หน้าตาเดิม)
export default function Header() {
  return (
    <header className="site-header">
      <div className="brand-row">
        <div className="brand">
          <div className="brand-mark">SU</div>
          <div>
            <h1>สวนพฤกษศาสตร์ไทย</h1>
            <p>THAI BOTANICAL ATLAS</p>
          </div>
        </div>
        <div className="header-note">ค้นพบธรรมชาติ<br />ใกล้ตัวคุณ</div>
      </div>
    </header>
  );
}
