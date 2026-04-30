import { Router } from "express";
import {
  getMe,
  login,
  logout,
  refresh,
  register,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

console.log("Registering /register route");
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
