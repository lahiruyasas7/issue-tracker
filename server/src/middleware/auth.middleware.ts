import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth.type";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = req.cookies?.access_token;
    if (!token) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
    ) as JwtPayload;

    req.user = decoded;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Token expired or invalid" });
  }
};
