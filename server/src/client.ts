/// <reference types="node" />
import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client";

// temporary debug - remove after fixing
console.log("DATABASE_HOST in client.ts:", process.env.DATABASE_HOST);
console.log("DATABASE_PORT in client.ts:", process.env.DATABASE_PORT);
console.log("DATABASE_NAME in client.ts:", process.env.DATABASE_NAME);
console.log("DATABASE_USER in client.ts:", process.env.DATABASE_USER);

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT), 
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

export { prisma };
