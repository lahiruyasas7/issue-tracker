import { Request, Response } from "express";
import { loginUser, registerUser } from "../Services/auth.service";
import { clearTokenCookies, setTokenCookies } from "../utils/token.util";
import { prisma } from "../client";
import { JwtPayload } from "../types/auth.type";
import jwt from "jsonwebtoken";
import { loginSchema, registerSchema } from "../validation-schemas/auth.schema";
import { ZodError } from "zod";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.parse(req.body);
    const user = await registerUser(parsed);
    const payload: JwtPayload = { userId: user.id, email: user.email };

    setTokenCookies(res, payload);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        errors: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.parse(req.body);
    const { payload, user } = await loginUser(parsed);

    setTokenCookies(res, payload);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        errors: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }
    res.status(401).json({ success: false, message: err.message });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) {
      res.status(401).json({ success: false, message: "No refresh token" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as JwtPayload;

    // Verify user still exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    const payload: JwtPayload = { userId: user.id, email: user.email };
    setTokenCookies(res, payload);

    res.status(200).json({ success: true, message: "Token refreshed" });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  clearTokenCookies(res);
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
