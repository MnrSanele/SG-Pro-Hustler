"use server";

import { signIn, signOut } from "@/lib/auth";
import { createUserWithCredentials } from "@/repositories/user.repository";
import { RegisterSchema } from "@/schemas/auth.schema";
import { slugify } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export async function loginAction(email: string, password: string) {
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch {
    return { success: false, error: "Invalid credentials" };
  }
}

export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
  role?: "REQUESTER" | "PROVIDER";
}) {
  const validated = RegisterSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return { success: false, error: "Email already registered" };

    const user = await createUserWithCredentials(validated.data);

    if (data.role === "PROVIDER") {
      const baseSlug = slugify(data.name);
      let slug = baseSlug;
      let i = 1;
      while (await prisma.providerProfile.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${i++}`;
      }
      await prisma.providerProfile.create({ data: { userId: user.id, slug } });
    } else {
      await prisma.requesterProfile.create({ data: { userId: user.id } });
    }

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("registerAction error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
}
