import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ตอนพัฒนา: ทุก request ที่ขึ้นต้นด้วย /api จะถูกส่งต่อไปที่ Express (พอร์ต 3001)
// ทำให้ไม่ต้องตั้งค่า CORS และ React ไม่ต้องรู้ที่อยู่ของ server
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:3001" }
  }
});
