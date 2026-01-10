import { Router } from "express";
import { postControllers } from "./post.controller";
import authMiddleware, { UserRole } from "../../middleware/auth.middleware";

const router: Router = Router();
router.get("/", postControllers.getAllPost);
router.post(
  "/",
  authMiddleware(UserRole.ADMIN, UserRole.USER),
  postControllers.createPost
);

export const postRoutes = router;
