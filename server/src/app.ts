import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import issueRoutes from "./routes/issue.routes";
import { errorHandler } from "./middleware/error.middleware";
import commentRoutes from "./routes/comment.routes";
import userRoutes from "./routes/user.routes";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [process.env.CLIENT_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/issues/comments", commentRoutes);
app.use("/api/users", userRoutes);

// Error handler
app.use(errorHandler);
export default app;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
