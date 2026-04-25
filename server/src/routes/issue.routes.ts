import { Router } from "express";
import { createIssueHandler } from "../controllers/issue.controller";
import { protect } from "../middleware/auth.middleware";
import { createIssueSchema } from "../validation-schemas/issue.schema";
import { validate } from "../middleware/validate.middleware";

const router = Router();

// All issue routes require authentication
router.use(protect);

router.post("/create", validate(createIssueSchema), createIssueHandler);

export default router;
