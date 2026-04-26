import { Router } from "express";
import {
  createIssueHandler,
  updateIssueHandler,
  updateIssueStatusHandler,
} from "../controllers/issue.controller";
import { protect } from "../middleware/auth.middleware";
import {
  createIssueSchema,
  updateIssueSchema,
  updateIssueStatusSchema,
} from "../validation-schemas/issue.schema";
import { validate } from "../middleware/validate.middleware";

const router = Router();

// All issue routes require authentication
router.use(protect);

router.post("/create", validate(createIssueSchema), createIssueHandler);
router.patch("/update/:id", validate(updateIssueSchema), updateIssueHandler);
router.patch(
  "/update/:id/status",
  validate(updateIssueStatusSchema),
  updateIssueStatusHandler,
);

export default router;
