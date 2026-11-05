// error ที่ตั้งใจส่งกลับให้ client พร้อมรหัสสถานะ
export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Express 4 ไม่จับ error ใน async handler ให้เอง จึงต้องห่อไว้
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function errorMiddleware(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  // [แก้ไข] error ที่เราตั้งใจโยน (HttpError) ส่งข้อความไทยของมันให้ client ได้แม้เป็น 502 (บริการภายนอกล่ม)
  // ส่วน error ที่ไม่คาดคิดยังซ่อนรายละเอียดไว้ ไม่เปิดเผยข้อมูลภายใน
  const intended = err instanceof HttpError;
  if (!intended && status >= 500) console.error(err);
  res.status(status).json({
    error: { code: err.code || "INTERNAL_ERROR", message: intended ? err.message : "เซิร์ฟเวอร์ขัดข้อง ลองใหม่อีกครั้ง" }
  });
}
