import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUserWithCredentials(data: {
  name: string;
  email: string;
  password: string;
  role?: "REQUESTER" | "PROVIDER";
}) {
  const hashedPassword = await bcrypt.hash(data.password, 12);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role ?? "REQUESTER",
      accounts: {
        create: {
          type: "credentials",
          provider: "credentials",
          providerAccountId: data.email,
          access_token: hashedPassword,
        },
      },
    },
  });
}
