import mongoose from "mongoose";
import { DB_URI, NODE_ENV } from "../config/env.js";

if (!DB_URI)
  throw new Error(
    "Plesae define the mongo DB variabled inside .env<development/production>.local"
  );

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

//connect to MongoDB
const connectToDatabase = async () => {
  try {
    if (!DB_URI)
      throw new Error(
        "Please define the mongo DB variabled inside .env<development/production>.local"
      );
    await mongoose.connect(DB_URI);
    console.log(`Connect to database in ${NODE_ENV} mode`);
  } catch (error) {
    console.log("DB_URI >>", DB_URI);
    console.log("Error connecting to the Database: ", error);
    process.exit(1);
  }
};

export default connectToDatabase;
