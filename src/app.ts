
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { postRoutes } from "./modules/post/post.route";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { commentRoutes } from "./modules/comment/comment.route";

const app: Application = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.APP_PUBLIC_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.all('/api/auth/*splat', toNodeHandler(auth));
//posts
app.use('/posts',postRoutes)
//comments
app.use('/comments',commentRoutes)
app.get("/", (req: Request, res: Response) => {
  res.send("hellow world");
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: "Not Found",
  });
});
export default app;
