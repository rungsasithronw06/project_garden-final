# สวนพฤกษศาสตร์ไทย (โปรเจกต์ไฟนอล)

React + Vite (หน้าร้าน) คุยกับ Express (ครัว) ผ่าน `/api/...` — หน้าตาและฟีเจอร์ทั้งหมดย้ายมาจากโปรเจกต์เดิม
ส่วนที่เพิ่มใหม่มีคอมเมนต์ `[เพิ่มใหม่]` กำกับไว้ในโค้ดทุกจุด

## วิธีรัน

```bash
npm install                        # ติดตั้ง server + client (npm workspaces)
cp server/.env.example server/.env # ไม่บังคับ — API ที่ใช้ไม่ต้องมี key ตั้งค่าได้ถ้าต้องการเปลี่ยนเซิร์ฟเวอร์
npm run dev                        # Express :3001 + Vite :5173 พร้อมกัน แล้วเปิด http://localhost:5173
npm test                           # เทสต์ server + client (ไม่ต้องใช้เน็ต)
```

## Deploy บน Vercel

1. Import repository นี้ใน Vercel โดยตั้ง **Root Directory** เป็นโฟลเดอร์รากของ repository
2. `vercel.json` กำหนด service `client` (Vite) และ `server` (Express) พร้อม rewrite `/api/*` ไป backend และ path อื่นไป frontend
3. กด Deploy ได้เลย ไม่จำเป็นต้องตั้ง Environment Variables สำหรับค่าปัจจุบัน

หน้าเว็บเรียก API ด้วย path แบบ relative (`/api/...`) จึงใช้โดเมนเดียวกับ backend ได้โดยตรง ไม่ต้องมี service binding; `server/data/backup.json` อยู่ภายใน service root ของ Express สำหรับ fallback ข้อมูล การทดสอบในเครื่องยังใช้ `npm run dev` ตามปกติ

## เช็คลิสต์ฟีเจอร์ไฟนอล

| # | ฟีเจอร์ | สถานะ |
|---|---|---|
| 1 | ค้นหา + พิมพ์ผิดก็หาเจอ | ✅ Fuzzy Search (`client/src/utils/dsa/fuzzySearch.js`) |
| 2 | กรองตามภาค | ✅ ของเดิม (`utils/dsa/filter.js`) |
| 3 | เรียงตามความนิยม | ✅ มาก→น้อย (เดิม) + น้อย→มาก `[เพิ่มใหม่]` (`utils/dsa/popularity.js`) |
| 4 | เส้นทางจากเส้นทางจริง (ไม่ใช่เส้นตรง) | ✅ เลือกจังหวัดต้นทาง → เปิดรายละเอียดสวน → `GET /api/route` → OSRM ถนนจริง (`GardenModal.jsx`) |
| 5 | สถานที่รอบๆ สวน | ✅ `GET /api/gardens/:id/places` → OpenStreetMap/Overpass (`PlacesList.jsx`) |
| 6 | สภาพอากาศ | ✅ `GET /api/gardens/:id/weather` → Open-Meteo (`WeatherCard.jsx`) |

> API เพิ่มเติม 3 ตัว (OSRM, Overpass, Open-Meteo) ฟรีและไม่ต้องใช้ key (API หลัก data.go.th ยังใช้ชุดเดิมทั้งหมด)

## โครงโฟลเดอร์

```
server/                         Express
  src/routes/gardens.js         GET /api/gardens (+ /:id/weather, /:id/places)
  src/routes/route.js           GET /api/route          เส้นทางถนนจริงระหว่าง 2 จุด
  src/services/dataGoTh.js      ดึง data.go.th: cache → API → cache เก่า → backup.json (ดึงขนาน)
  src/services/gardenBuilder.js รวมสวน + จับคู่ยอดผู้เข้าชมด้วย Hash Map
  src/services/routing.js       [ใหม่] OSRM Table API ระยะ+เวลาถนนจริง (ถอยไปเส้นตรงถ้าล่ม)
  src/services/weather.js       [ใหม่] Open-Meteo: แปลงรหัสอากาศ, สรุปคำแนะนำ, cache 30 นาที
  src/services/places.js        [ใหม่] Overpass: จัดหมวด, ตัดซ้ำ (Hash Map), เรียงตามระยะ, cache 24 ชม.
  src/services/cache.js         TTL cache + ตัวนับ /api/stats
  src/utils/                    validate, errors, geo
  scripts/check-places.mjs      เครื่องมือตรวจ Overpass (วัดเวลา status / query จิ๋ว / query จริง) — ใช้ตอนสถานที่รอบสวนไม่ขึ้น
  data/backup.json              ข้อมูลสำรองจากงานเดิม
client/                         React + Vite
  public/assets/images/         รูปสวนทั้งหมดจากงานเดิม (ชื่อไฟล์เป็นภาษาอังกฤษ เช่น chombueng01.png)
  src/data/                     provinces.js (พิกัดจังหวัด), gardenImageGroups.js (รูปของแต่ละสวน)
  src/utils/dsa/                linearSearch, mergeSort (+takeFirst), filter — ของเดิม · fuzzySearch — [เพิ่มใหม่]
  src/utils/                    geo (Haversine), text (normalizeName), gardenImages, api
  src/hooks/useGardens.js       ดึงข้อมูลจาก Express + สถานะ loading/success/empty/error
  src/components/               ดู Component Tree
  src/styles.css                CSS เดิม + ปรับ UX (ผลลัพธ์ขึ้นก่อน, sidebar ติดจอ, bottom sheet ตัวกรองบนมือถือ, การ์ดรายละเอียด 2 คอลัมน์)
```

## Component Tree

```
App                               state: query, filters, selected  ·  hooks: useGardens
├─ Header
├─ SearchPanel                    แผงซ้าย (มือถือ: ปุ่ม "ตัวกรอง" เปิดเป็น bottom sheet)
│  ├─ SearchBox                   ช่องค้นหา + รายการแนะนำ 5 อันดับ
│  └─ SelectField ×2              ภูมิภาค / จังหวัดต้นทาง
├─ PopularList                    [ใหม่] 3 สวนยอดนิยมใต้แผงซ้าย (เฉพาะจอใหญ่)
├─ ResultsArea                    หัวข้อ + สถานะ + เรียงตาม (มาก↔น้อย) + ตารางการ์ด — อยู่ก่อนสไลด์เสมอ
│  ├─ ActiveFilters               [ใหม่] ชิปตัวกรองที่ใช้อยู่ กด × เอาออก
│  ├─ StatusBox                   [ใหม่] loading / error (+ลองอีกครั้ง) / empty ของรายการสวน
│  └─ GardenCard ── ImageSlot     ชื่อ 2 บรรทัด + ยอดผู้เข้าชม + ระยะทาง
├─ FeaturedCarousel               5 สวนยอดนิยม เลื่อนอัตโนมัติ 4 วินาที (เฉพาะมือถือ)
│  └─ ImageSlot
└─ GardenModal                    (แสดงเมื่อเลือกสวน)
   ├─ ImageGallery
   ├─ WeatherCard                 [ใหม่] ── StatusBox  (useFetch)
   └─ PlacesList                  [ใหม่] ── StatusBox  (useFetch)
```

ข้อมูลไหลทางเดียว: `App` ถือ state แล้วส่งลงเป็น props, component ลูกเรียก callback กลับขึ้นมา
การคุยกับ Express อยู่ใน hook เท่านั้น: `useGardens` (รายการสวน), `useFetch` (เส้นทางถนนจริง/อากาศ/สถานที่รอบสวน)

## สิ่งที่ต่างจากโปรเจกต์เดิม (ตั้งใจ)

| เรื่อง | เดิม | ตอนนี้ |
|---|---|---|
| แหล่งข้อมูล | browser เรียก `/api/proxy` แล้วรวมข้อมูลเอง | Express รวมข้อมูลให้ที่ `/api/gardens` (Hash Map join ย้ายมาฝั่ง Express) |
| โหลดไม่สำเร็จ | ขึ้นข้อความอย่างเดียว | `[เพิ่มใหม่]` ขึ้นข้อความ + ปุ่ม "ลองอีกครั้ง" |
| ตัวกรอง dropdown | อ่านค่าสดตอนมีการพิมพ์ค้นหา | มีผลทันทีที่เลือก (ไม่ต้องกดยืนยัน) ปุ่มล่างเป็น "ดูผลลัพธ์" |
| ค้นหา | ต้องพิมพ์ถูกทั้งคำ | `[เพิ่มใหม่]` พิมพ์ผิดเล็กน้อยก็ยังเจอ |
| ไฟล์ | `index.html` ไฟล์เดียว | แยกเป็น component/hook/util (DSA เดิมไม่ได้แก้ตรรกะ) |
| `vercel.json` | มี | เพิ่ม config ให้ deploy frontend + Express API บน Vercel |

## 7. ตารางสำหรับ README และคลิป

### 7.1 ตารางส่วนร่วม

> ข้อมูลสมมติ 1 คน — **แก้เป็นชื่อ รหัสนักศึกษา และช่วงคลิปจริงก่อนส่ง**

| ชื่อ-สกุล | รหัสนักศึกษา | ชิ้นงานที่รับผิดชอบ (ไฟล์ / component / route / DSA) | ช่วงที่นำเสนอในคลิป |
|---|---|---|---|
| วรัญญา รุ่งศศิธร | 681310021 | **Frontend:** `App.jsx`, `SearchPanel`, `ResultsArea`, `ActiveFilters`, `PopularList`, `GardenModal`, `StatusBox`, hooks `useGardens` / `useFetch`, `styles.css` (UX จอใหญ่ + bottom sheet มือถือ)<br>**Backend:** route `GET /api/gardens`, `/:id/weather`, `/:id/places`, `GET /api/route`; `cache.js`, `validate.js`, `gardenBuilder.js`, `places.js`, `routing.js`, `weather.js`<br>**DSA:** Edit Distance (`fuzzySearch.js`), Merge Sort (`popularity.js`, `mergeSort.js`), Hash Map (`gardenBuilder.js`, `cache.js`, `places.js`) | 00:00 – 00:00 (ใส่ช่วงเวลาจริง) |

### 7.2 ตารางข้อแนะนำจากงานแรก → สิ่งที่แก้

ภาพ Before / After ทั้งหมดอยู่ในไดรฟ์: **[เปิดโฟลเดอร์ภาพ](https://drive.google.com/drive/folders/10HGunnBjgRNKzTGF3MJzeW2JHeDzUNfy?usp=sharing)**

| ข้อแนะนำจากงานแรก | สิ่งที่แก้ในงานนี้ | หลักฐาน Before / After |
|---|---|---|
| **1a. UX มือถือ:** ผลการค้นหาลงไปกองข้างล่างจอ มองไม่เห็นผลลัพธ์ | **เดิม:** แผงค้นหา (ช่องค้นหา + dropdown 3 ช่อง + ปุ่ม + รูปแผนที่) อยู่บนสุด ตามด้วยสไลด์ 250px ผลลัพธ์อยู่ไกลลงไปหลายจอ<br>**ตอนนี้:** จอ ≤ 850px เหลือช่องค้นหา + ปุ่ม "ตัวกรอง (n)" เปิดเป็น bottom sheet มีปุ่ม "ดูผลลัพธ์ (N สวน)" ผลลัพธ์ขึ้นก่อนสไลด์ และมีชิปตัวกรองกด × เอาออกได้ (`SearchPanel.jsx`, `ResultsArea.jsx`, `ActiveFilters.jsx`, `styles.css` ช่วง `@media`) | **Before:** 📷 _[ใส่ภาพ: มือถือก่อนแก้ — หน้าแรกก่อนเลื่อน]_<br>**After:** 📷 _**[รอใส่ภาพ: มือถือหลังแก้ — ถ่ายจากเว็บที่ deploy แล้ว]**_ |
| **1b. UX จอใหญ่ (PC):** ผลลัพธ์อยู่ใต้สไลด์ต้องเลื่อนลงไปดู | **เดิม:** สไลด์สวนยอดนิยมขนาดใหญ่อยู่เหนือผลลัพธ์ และมีปุ่ม "ดูผลลัพธ์" ที่ต้องกดยืนยัน<br>**ตอนนี้:** ผลลัพธ์อยู่บนสุด แผงค้นหาติดจอด้านซ้าย (sticky) ตัวกรองมีผลทันที สวนยอดนิยมย้ายเป็นรายการ 3 อันดับใต้แผงซ้าย (`PopularList.jsx`) | **Before:** 📷 _[ใส่ภาพ: PC ก่อนแก้ — หน้าแรกเต็มจอ]_<br>**After:** 📷 _[ใส่ภาพ: PC หลังแก้ — หน้าแรกเต็มจอ]_ |
| **2. API ต่อยอดยาก** ไอเดียตัน | **เดิม:** ใช้ data.go.th ชุดเดียว ได้แค่ชื่อ ที่อยู่ พิกัด ยอดผู้เข้าชม<br>**ตอนนี้:** ยังใช้ data.go.th เป็นข้อมูลหลัก แล้วต่อยอดด้วยพิกัดของสวนไปหา อากาศ (Open-Meteo) สถานที่รอบสวน (Overpass/OpenStreetMap) และเส้นทางถนนจริง (OSRM) ทั้งหมดผ่าน Express (`weather.js`, `places.js`, `routing.js`) แจ้งขออนุมัติอาจารย์แล้ว | **Before:** 📷 _[ใส่ภาพ: หน้ารายละเอียดสวนก่อนแก้ — มีแค่ชื่อ ที่อยู่ ยอดผู้เข้าชม]_<br>**After:** 📷 _[ใส่ภาพ: หน้ารายละเอียดสวนหลังแก้ — การ์ดอากาศ + สถานที่รอบสวน]_ |
| **3. เส้นทางเป็นเส้นตรง** ไม่ได้คำนวณจากเส้นทางจริง | **เดิม:** Haversine ตรงจากพิกัดจังหวัดถึงสวน เวลา = ระยะ ÷ 60<br>**ตอนนี้:** เลือกจังหวัดต้นทาง → Express เรียก OSRM ได้ระยะ + เวลาตามถนนจริง (`GET /api/route`, `GardenModal.jsx`) ถ้า OSRM ล่มจะบอกชัดว่า "เส้นตรง (ประมาณ)" แทนที่จะแสดงเหมือนเป็นค่าจริง | **Before:** 📷 _[ใส่ภาพ: ระยะแบบเส้นตรง — ป้าย "~ กม. เส้นตรง" บนการ์ด]_<br>**After:** 📷 _[ใส่ภาพ: ระยะ + เวลาตามถนนจริงในหน้ารายละเอียด]_ |


## เงื่อนไขอาจารย์ ↔ ไฟล์

| เงื่อนไข | อยู่ที่ไหน |
|---|---|
| 1 API เดิม | `server/src/constants.js` (ชุด data.go.th เดิม) · API เพิ่มเติมอยู่ `server/src/config.js`
| 2 React + Vite + Component Tree | `client/`, หัวข้อ Component Tree |
| 3 Express มีหน้าที่จริง | validate (`utils/validate.js`), cache TTL (`services/cache.js`), รวม/จับคู่ข้อมูล (`gardenBuilder.js`), เส้นทางถนนจริง (`routing.js`), แปลง/สรุปข้อมูลอากาศ (`weather.js`), จัดหมวด/ตัดซ้ำสถานที่ (`places.js`), fallback (`dataGoTh.js`, `routing.js`), ซ่อน URL/พิกัดจริงจาก client (รับ id สวนแทนพิกัด) |
| 4 UX 4 สถานะ | `useGardens.js`, `useFetch.js`, `StatusBox.jsx` · flow สั้นลง: ตัวกรองมีผลทันที (ไม่ต้องกดยืนยัน) |
| 5 Before → After | ตาราง 7.2 ด้านบน (ภาพหลักฐานอยู่ในไดรฟ์) |
| 6 DSA เชิงลึก | ดูตารางด้านล่าง |

## DSA (ใช้กับข้อมูลจริง)

| ที่ | DSA | ฝั่ง | Big-O | เหตุผล / Before → After |
|---|---|---|---|---|
| `fuzzySearch.js` | Edit Distance (Sellers) DP | React | O(m·n) ต่อสวน | พิมพ์ผิดแล้วยังเจอ (ไม่เจอเลยในของเดิม) |
| `popularity.js` | Merge Sort + แยกกลุ่ม | React | O(n log n) | น้อย→มากโดยให้ "ไม่มีข้อมูล (0)" ไปท้าย ไม่งั้น 6 จาก 17 แถวในตารางสถิติจะขึ้นก่อนทั้งที่แค่ไม่มีข้อมูล |
| `gardenBuilder.js` | Hash Map join | Express | O(n) แทน O(n²) | จับคู่ชื่อสวนกับยอดผู้เข้าชม |
| `places.js` | Hash Map ตัดซ้ำ + Merge Sort ต่อหมวด | Express | O(p log p) | OSM มีทั้งจุดและอาคารของที่เดียวกัน |
| `cache.js` | Hash Map + TTL | Express | O(1) | `GET /api/stats` เทียบจำนวนครั้งที่ยิง API ก่อน/หลังมี cache |

เทสต์: `npm test` (server 14 ข้อ, client 9 ข้อ — ปลอมบริการภายนอก ไม่ต้องใช้เน็ต)

## หมายเหตุ

- ข้อมูลสวนมี 13 แห่ง (เท่ากับ `backup.json`) ส่วนตารางสถิติผู้เข้าชมมี 17 แถว แถวที่จับคู่กับสวนไม่ได้ดูที่ `meta.unmatchedVisitorNames` ใน `/api/gardens`
- ยอดผู้เข้าชม 0 อาจแปลว่า "ไม่มีข้อมูล" (6 จาก 17 แถวเป็น 0) การ์ดสวนแสดงเป็น "ยังไม่มีข้อมูลผู้เข้าชม"
- OSRM public server (`router.project-osrm.org`) เหมาะกับการสาธิต/ใช้เบา ๆ ถ้าจะใช้จริงจังให้ตั้ง `OSRM_BASE_URL` เป็นเซิร์ฟเวอร์ของตัวเอง; Overpass มีขีดจำกัดการเรียกเช่นกัน (จึง cache 24 ชม.)
- ข้อมูลสถานที่จาก OpenStreetMap ในพื้นที่ห่างไกลอาจไม่ครบ — หน้าเว็บจึงมีสถานะ "ไม่พบสถานที่" แยกจาก error
- ขอบเขต DSA : ใช้เฉพาะ Merge Sort, Edit Distance (DP), Hash Map, Linear Search ที่ใช้ในงานเดิม/ที่เรียน

git status
