import { Router } from "express";
import {
  createIssueHandler,
  deleteIssueHandler,
  exportIssuesHandler,
  getIssueByIdHandler,
  getIssuesHandler,
  updateIssueHandler,
  updateIssueStatusHandler,
} from "../controllers/issue.controller";
import { protect } from "../middleware/auth.middleware";
import {
  createIssueSchema,
  exportIssuesQuerySchema,
  getIssuesQuerySchema,
  updateIssueSchema,
  updateIssueStatusSchema,
} from "../validation-schemas/issue.schema";
import { validate } from "../middleware/validate.middleware";

const router = Router();

// All issue routes require authentication
router.use(protect);

router.post("/create", validate(createIssueSchema), createIssueHandler);
router.get("/", validate(getIssuesQuerySchema, "query"), getIssuesHandler);
router.get(
  "/export",
  validate(exportIssuesQuerySchema, "query"),
  exportIssuesHandler,
);
router.patch("/update/:id", validate(updateIssueSchema), updateIssueHandler);
router.patch(
  "/update/:id/status",
  validate(updateIssueStatusSchema),
  updateIssueStatusHandler,
);
router.get("/:id", getIssueByIdHandler);
router.delete("/:id", deleteIssueHandler);

export default router;
