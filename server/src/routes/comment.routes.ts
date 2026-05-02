// import { Router } from "express";
// import { protect } from "../middleware/auth.middleware";
// import { validate } from "../middleware/validate.middleware";
// import {
//   createCommentHandler,
//   deleteCommentHandler,
// } from "../controllers/comment.controller";
// import { createCommentSchema } from "../validation-schemas/comment.schema";

// const router = Router({ mergeParams: true }); // mergeParams to access :issueId

// router.use(protect);

// router.post("/:issueId", validate(createCommentSchema), createCommentHandler);
// router.delete("/:commentId", deleteCommentHandler);

// export default router;
