// ส่วนหัวเว็บ
// [แก้ไข UX] ชื่อให้ตรงกับชื่อโปรเจกต์ "สวนพฤกษศาสตร์ใกล้ฉัน" และเปลี่ยนคำโปรยใต้ชื่อให้บอกว่าเว็บทำอะไรได้ (โลโก้ SU คงเดิม)
export default function Header() {
  return (
    <header className="site-header">
      <div className="brand-row">
        <div className="brand">
          <div className="brand-mark">SU</div>
          <div>
            <h1>สวนพฤกษศาสตร์ใกล้ฉัน</h1>
            <p>ค้นหาสวนพฤกษศาสตร์ทั่วไทย ดูอากาศและเส้นทางก่อนไป</p>
          </div>
        </div>
        <div className="header-note">ค้นพบธรรมชาติใกล้ตัวคุณ</div>
      </div>
    </header>
  );
}
