import bcrypt from "bcryptjs";
import { JwtPayload } from "../types/auth.type";
import { prisma } from "../client";
import { LoginBody, RegisterBody } from "../validation-schemas/auth.schema";

export const registerUser = async (body: RegisterBody) => {
  if (!body.name || !body.email || !body.password) {
    throw new Error("Missing required fields: name, email, password");
  }
  const { name, email, password } = body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return user;
};

export const loginUser = async (body: LoginBody) => {
  const { email, password } = body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const payload: JwtPayload = { userId: user.id, email: user.email };

  return {
    payload,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
};
