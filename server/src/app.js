import express from "express";
import gardensRouter from "./routes/gardens.js";
import routeRouter from "./routes/route.js";
import { HttpError, errorMiddleware } from "./utils/errors.js";
import { stats } from "./services/cache.js";

export const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
// ตัวเลขไว้ใช้เทียบ Before → After ในรายงาน
app.get("/api/stats", (req, res) => res.json(stats));

app.use("/api/gardens", gardensRouter);
app.use("/api/route", routeRouter);

app.use("/api", (req, res, next) => next(new HttpError(404, "NOT_FOUND", "ไม่พบ endpoint นี้")));
app.use(errorMiddleware);
