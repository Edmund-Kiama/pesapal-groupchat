import {config} from "dotenv"

config({path : `.env.${process.env.NODE_ENV || "development"}.local`})

export const {
  PORT,
  NODE_ENV,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  DB_URI,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  EMAIL_FROM,
  EMAIL_FROM_NAME,
  FRONTEND_URL,
} = process.env;