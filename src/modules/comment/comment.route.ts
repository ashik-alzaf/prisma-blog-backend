import { Router } from "express";
import { commentControllers } from "./comment.controller";
import authMiddleware, { UserRole } from "../../middleware/auth.middleware";

const router: Router = Router();
router.get("/author/:authorId", commentControllers.getCommentsByAuthor);
router.get("/:commentId", commentControllers.getByCommentId);
router.post(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  commentControllers.createComment
);
router.patch(
  "/:commentId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  commentControllers.updateComment
);
router.delete(
  "/:commentId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  commentControllers.deleteComment
);
router.patch(
  "/moderate/:commentId",
  authMiddleware(UserRole.ADMIN),
  commentControllers.moderateComment
);
export const commentRoutes = router;
