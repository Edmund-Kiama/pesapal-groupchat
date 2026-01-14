import { sequelize } from "./db.js";

export async function connectDB() {
  const MAX_RETRIES = 5;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `⏳ Connecting to database (attempt ${attempt}/${MAX_RETRIES})...`
      );
      await sequelize.authenticate();
      console.log("✅ Database connected");
      return;
    } catch (error) {
      console.error(`❌ DB connection attempt ${attempt} failed`);

      if (attempt === MAX_RETRIES) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
