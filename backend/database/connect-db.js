import { sequelize } from "./db.js";
import * as models from "../models/index.js";

export async function connectDB() {
  const MAX_RETRIES = 10;
  const RETRY_DELAY = 3000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `⏳ Connecting to database (attempt ${attempt}/${MAX_RETRIES})...`
      );

      await sequelize.authenticate();
      console.log("✅ Database connected");

      await sequelize.sync({ alter: true });
      console.log("📦 Models synced to database");

      return;
    } catch (error) {
      console.error(`❌ DB connection attempt ${attempt} failed`);

      if (attempt === MAX_RETRIES) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

export async function closeDB() {
  try {
    await sequelize.close();
    console.log("🔒 Database connection closed");
  } catch (error) {
    console.error("❌ Error closing database connection:", error.message);
  }
}
