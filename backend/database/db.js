import { Sequelize } from 'sequelize';
import { DATABASE_URL } from '../config/env.js';

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from environment variables!");
}

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Set to console.log if you want to see SQL queries
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required for Railway public connections
    },
    // This helps prevent the connection from hanging
    keepAlive: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000, // Wait 60s for a connection before timing out
    idle: 10000,
  },
});