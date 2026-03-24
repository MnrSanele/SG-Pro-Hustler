import { prisma } from "@/lib/prisma";

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getActiveCategoriesWithSkills() {
  return prisma.category.findMany({
    where: { isActive: true },
    include: {
      skills: {
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}
