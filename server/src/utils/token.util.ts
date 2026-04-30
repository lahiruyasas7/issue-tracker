import jwt from "jsonwebtoken";
import { Response } from "express";
import { JwtPayload } from "../types/auth.type";

const isProd = process.env.NODE_ENV === "production";

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });
};

export const setTokenCookies = (res: Response, payload: JwtPayload): void => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: isProd, // true in production (HTTPS only)
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes in ms
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/api/auth/refresh", // refresh token only sent to this endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });
};

export const clearTokenCookies = (res: Response): void => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token", { path: "/api/auth/refresh" });
};
