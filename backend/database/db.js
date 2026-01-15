import { Sequelize } from 'sequelize';
import { DATABASE_URL } from '../config/env.js';

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from environment variables!");
}

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  logging: false, 
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
   
    keepAlive: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 60000, 
    idle: 10000,
  },
});