import { Response, Request } from "express";
import { prisma } from "../client";

// GET /api/users
// Returns all users for assignee dropdown

export const getUsersHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({ success: true, data: users });
  } catch {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
