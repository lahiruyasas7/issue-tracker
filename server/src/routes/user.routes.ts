import { Router } from "express";
import { getUsersHandler } from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.get("/", getUsersHandler);

export default router;
