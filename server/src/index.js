import { app } from "./app.js";
import { config } from "./config.js";

app.listen(config.port, () => {
  console.log(`Express พร้อมใช้งานที่ http://localhost:${config.port}`);
});
