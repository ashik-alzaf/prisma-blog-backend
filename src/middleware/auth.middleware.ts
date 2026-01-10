import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}
const authMiddleware = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });
      if (!session) {
        return res.status(404).json({ message: "You are unauthorized!!" });
      }
      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email verfication requried!. Please verify your email",
        });
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as string,
        emailVerified: session.user.emailVerified,
      };
      if (roles.length && !roles.includes(req.user?.role as UserRole)) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden! You don't have permission to access this resources",
        });
      }
      next();
    } catch (error) {
      throw error;
    }
  };
};
export default authMiddleware;
