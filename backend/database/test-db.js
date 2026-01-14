import { sequelize } from "./db.js";

async function test() {
  const MAX_RETRIES = 5;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(
        `⏳ Attempting to connect to Railway (attempt ${attempt}/${MAX_RETRIES})...`
      );

      await sequelize.authenticate();
      console.log("✅ Connection successful!");

      // Optional: Run a simple query to prove data flow
      const [results] = await sequelize.query("SELECT NOW();");
      console.log("📊 Database Time:", results[0].now);

      await sequelize.close();
      return; // exit after success
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed`);
      console.error("Error Name:", error.name);
      console.error("Message:", error.message);

      if (attempt === MAX_RETRIES) {
        console.error("🚫 All connection attempts failed");
        throw error;
      }

      // wait 2 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

test();
