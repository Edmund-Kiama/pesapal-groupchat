import dotenv from "dotenv";
dotenv.config();

export default {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres"
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres"
  }
};
