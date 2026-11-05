# สวนพฤกษศาสตร์ไทย (โปรเจกต์ไฟนอล)

React + Vite (หน้าร้าน) คุยกับ Express (ครัว) ผ่าน `/api/...` — หน้าตาและฟีเจอร์ทั้งหมดย้ายมาจากโปรเจกต์เดิม
ส่วนที่เพิ่มใหม่มีคอมเมนต์ `[เพิ่มใหม่]` กำกับไว้ในโค้ดทุกจุด

## วิธีรัน

```bash
npm install                        # ติดตั้ง server + client (npm workspaces)
cp server/.env.example server/.env # ใส่ key ภายหลัง (ตอนนี้เว้นว่างได้)
npm run dev                        # Express :3001 + Vite :5173 พร้อมกัน แล้วเปิด http://localhost:5173
npm test                           # เทสต์ server + client (ไม่ต้องใช้เน็ต)
```

## เช็คลิสต์ฟีเจอร์ไฟนอล

| # | ฟีเจอร์ | สถานะ |
|---|---|---|
| 1 | ค้นหา + พิมพ์ผิดก็หาเจอ | ✅ Fuzzy Search (`client/src/utils/dsa/fuzzySearch.js`) |
| 2 | กรองตามภาค | ✅ ของเดิม (`utils/dsa/filter.js`) |
| 3 | เรียงตามความนิยม | ✅ มาก→น้อย (เดิม) + น้อย→มาก `[เพิ่มใหม่]` (`utils/dsa/popularity.js`) |
| 4 | เส้นทางจากเส้นทางจริง (ไม่ใช่เส้นตรง) | ✅ เลือกจังหวัดต้นทาง → เปิดรายละเอียดสวน → `GET /api/route` → OSRM ถนนจริง (`GardenModal.jsx`) |
| 5 | สถานที่รอบๆ สวน | ✅ `GET /api/gardens/:id/places` → OpenStreetMap/Overpass (`PlacesList.jsx`) |
| 6 | สภาพอากาศ | ✅ `GET /api/gardens/:id/weather` → Open-Meteo (`WeatherCard.jsx`) |

> API เพิ่มเติม 3 ตัว (OSRM, Overpass, Open-Meteo) ฟรีและไม่ต้องใช้ key แต่ข้อ 1 ของอาจารย์ระบุว่าต้องขออนุมัติ — **ควรส่งข้อความขออนุมัติอาจารย์ก่อนส่งงาน** (API หลัก data.go.th ยังใช้ชุดเดิมทั้งหมด)

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
  data/backup.json              ข้อมูลสำรองจากงานเดิม
client/                         React + Vite
  public/assets/images/         รูปสวนทั้งหมดจากงานเดิม (ชื่อไฟล์เป็นภาษาอังกฤษ เช่น chombueng01.png)
  src/data/                     provinces.js (พิกัดจังหวัด), gardenImageGroups.js (รูปของแต่ละสวน)
  src/utils/dsa/                linearSearch, mergeSort (+takeFirst), filter — ของเดิม · fuzzySearch — [เพิ่มใหม่]
  src/utils/                    geo (Haversine), text (normalizeName), gardenImages, api
  src/hooks/useGardens.js       ดึงข้อมูลจาก Express + สถานะ loading/success/empty/error
  src/components/               ดู Component Tree
  src/styles.css                CSS เดิมทั้งหมด (คัดลอกมาไม่แก้)
```

## Component Tree

```
App                               state: query, filters, selected  ·  hooks: useGardens
├─ Header
├─ SearchPanel                    แผงซ้าย (มือถือ: พับตัวกรองได้)
│  ├─ SearchBox                   ช่องค้นหา + รายการแนะนำ 5 อันดับ
│  └─ SelectField ×3              ภูมิภาค / ความนิยม (มาก↔น้อย) / จังหวัดต้นทาง
├─ FeaturedCarousel               5 สวนยอดนิยม เลื่อนอัตโนมัติ 4 วินาที
│  └─ ImageSlot
├─ ResultsArea                    หัวข้อ + สถานะ + ตารางการ์ด
│  └─ GardenCard ── ImageSlot
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
| `vercel.json` | มี | ยังไม่ได้ย้ายมา (deploy ไม่บังคับ) |

## ข้อแนะนำของอาจารย์ → แก้อย่างไร (Before → After)

| # | ข้อแนะนำ | Before | After |
|---|---|---|---|
| 1 | UX มือถือ ผลลัพธ์ลงไปกองข้างล่าง | แผงค้นหา (ช่องค้นหา + dropdown 3 ช่อง + ปุ่ม + รูปแผนที่) อยู่บนสุดแล้วตามด้วยสไลด์ 250px ผลลัพธ์จึงอยู่ไกลลงไปหลายจอ | จอ ≤ 850px: ตัวกรองพับเก็บ (ปุ่ม "ตัวกรองและการเรียง") ซ่อนรูปแผนที่ สลับลำดับเป็น ผลการค้นหา → สวนยอดนิยม และปุ่ม "ดูผลลัพธ์ (N สวน)" เลื่อนไปที่ผลลัพธ์ให้ (`SearchPanel.jsx`, `styles.css` ช่วง `@media`) |
| 2 | API ต่อยอดยาก ไอเดียตัน | มีแต่ data.go.th ชุดเดียว | ยังใช้ data.go.th เป็นข้อมูลหลัก + ต่อยอดด้วยพิกัดของสวนไปหา เส้นทาง / อากาศ / สถานที่รอบสวน (ต้องขออนุมัติอาจารย์) |
| 3 | เส้นทางเป็นเส้นตรง | Haversine ตรงจากพิกัดจังหวัดถึงสวน, เวลา = ระยะ ÷ 60 | Express เรียก OSRM ได้ระยะ+เวลาตามถนนจริง; ถ้า OSRM ล่มจะบอกชัดว่า "ระยะเส้นตรง (ประมาณ)" แทนที่จะแสดงเหมือนเป็นค่าจริง |

## เงื่อนไขอาจารย์ ↔ ไฟล์

| เงื่อนไข | อยู่ที่ไหน |
|---|---|
| 1 API เดิม | `server/src/constants.js` (ชุด data.go.th เดิม) · API เพิ่มเติมอยู่ `server/src/config.js` — รอขออนุมัติ |
| 2 React + Vite + Component Tree | `client/`, หัวข้อ Component Tree |
| 3 Express มีหน้าที่จริง | validate (`utils/validate.js`), cache TTL (`services/cache.js`), รวม/จับคู่ข้อมูล (`gardenBuilder.js`), เส้นทางถนนจริง (`routing.js`), แปลง/สรุปข้อมูลอากาศ (`weather.js`), จัดหมวด/ตัดซ้ำสถานที่ (`places.js`), fallback (`dataGoTh.js`, `routing.js`), ซ่อน URL/พิกัดจริงจาก client (รับ id สวนแทนพิกัด) |
| 4 UX 4 สถานะ | `useGardens.js`, `useFetch.js`, `StatusBox.jsx` · flow สั้นลง: ตัวกรองมีผลทันที (ไม่ต้องกดยืนยัน) |
| 5 Before → After | ตารางด้านบน |
| 6 DSA เชิงลึก | ดูตารางด้านล่าง |

## DSA (ใช้กับข้อมูลจริง)

| ที่ | DSA | ฝั่ง | Big-O | เหตุผล / Before → After |
|---|---|---|---|---|
| `fuzzySearch.js` | Edit Distance (Sellers) DP | React | O(m·n) ต่อสวน | พิมพ์ผิดแล้วยังเจอ (ไม่เจอเลยในของเดิม) |
| `popularity.js` | Merge Sort + แยกกลุ่ม | React | O(n log n) | น้อย→มากโดยให้ "ไม่มีข้อมูล (0)" ไปท้าย ไม่งั้น 6 จาก 17 สวนจะขึ้นก่อนทั้งที่แค่ไม่มีข้อมูล |
| `gardenBuilder.js` | Hash Map join | Express | O(n) แทน O(n²) | จับคู่ชื่อสวนกับยอดผู้เข้าชม |
| `places.js` | Hash Map ตัดซ้ำ + Merge Sort ต่อหมวด | Express | O(p log p) | OSM มีทั้งจุดและอาคารของที่เดียวกัน |
| `cache.js` | Hash Map + TTL | Express | O(1) | `GET /api/stats` เทียบจำนวนครั้งที่ยิง API ก่อน/หลังมี cache |

เทสต์: `npm test` (server 17 ข้อ, client 9 ข้อ — ปลอมบริการภายนอก ไม่ต้องใช้เน็ต)

## หมายเหตุ

- `backup.json` มี 13 สวน แต่สถิติผู้เข้าชมมี 17 แถว (วังน้ำเย็น, บ้านเพ, เขาหินซ้อน, สุไหงปาดี ไม่อยู่ใน backup) ข้อมูลสดอาจมีครบ รายชื่อที่จับคู่ไม่ได้ดูที่ `meta.unmatchedVisitorNames` ใน `/api/gardens`
- ยอดผู้เข้าชม 0 อาจแปลว่า "ไม่มีข้อมูล" (6 จาก 17 แถวเป็น 0) ตอนนี้แสดงเป็น 0 คนเหมือนเดิม
- OSRM public server (`router.project-osrm.org`) เหมาะกับการสาธิต/ใช้เบา ๆ ถ้าจะใช้จริงจังให้ตั้ง `OSRM_BASE_URL` เป็นเซิร์ฟเวอร์ของตัวเอง; Overpass มีขีดจำกัดการเรียกเช่นกัน (จึง cache 24 ชม.)
- ข้อมูลสถานที่จาก OpenStreetMap ในพื้นที่ห่างไกลอาจไม่ครบ — หน้าเว็บจึงมีสถานะ "ไม่พบสถานที่" แยกจาก error
- ขอบเขต DSA (ข้อ 7): ใช้เฉพาะ Merge Sort, Edit Distance (DP), Hash Map, Linear Search ที่ใช้ในงานเดิม/ที่เรียน — ควรเช็คกับหัวข้อในคาบเรียนอีกครั้ง
