import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middlerware/error.middleware";
import path from "path";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Error handler (must be last)
app.use(errorHandler);
export default app;
