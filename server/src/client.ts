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
  connectTimeout: 10000, // CRITICAL: Increase from default 1s to 10s
  acquireTimeout: 10000, // Increase pool acquisition timeout
  idleTimeout: 300, // Match v6 default (300s)
    ssl: {
    rejectUnauthorized: false  // Accept self-signed cert
  }
});
const prisma = new PrismaClient({ adapter });

// Test connection immediately on startup
async function testConnection() {
  const start = Date.now();
  try {
    await prisma.$connect();
    console.log(`Database connected successfully in ${Date.now() - start}ms`);

    // Run a simple query to verify
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Query test result:", result);
  } catch (error) {
    console.error(`Database connection failed after ${Date.now() - start}ms`);
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    if (error.cause) {
      console.error("Error cause:", error.cause);
    }
    // Don't throw here — let the app start so you can see logs
    // But mark that DB is down
  }
}

testConnection();

export { prisma };
