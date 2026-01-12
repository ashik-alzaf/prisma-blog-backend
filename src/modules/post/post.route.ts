import { Router } from "express";
import { postControllers } from "./post.controller";
import authMiddleware, { UserRole } from "../../middleware/auth.middleware";

const router: Router = Router();
router.get("/", postControllers.getAllPost);
router.get(
  "/stats",
  authMiddleware(UserRole.ADMIN),
  postControllers.getStats
);
router.get(
  "/my-posts",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  postControllers.getMyPost
);
router.get("/:postId", postControllers.getByAuthorId);

router.post(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  postControllers.createPost
);
router.patch(
  "/:postId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  postControllers.updatePost
);
router.delete(
  "/:postId",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  postControllers.deletePost
);

export const postRoutes = router;
