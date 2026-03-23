import { prisma } from "@/lib/prisma";
import type { NotificationType, Prisma } from "@prisma/client";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Prisma.InputJsonValue
) {
  return prisma.notification.create({
    data: { userId, type, title, message, data },
  });
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true, readAt: new Date() },
  });
}
