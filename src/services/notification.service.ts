import { prisma } from "@/lib/prisma";
import type { NotificationType, Prisma } from "@prisma/client";

type NotificationDb = Pick<typeof prisma, "notification">;

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Prisma.InputJsonValue,
  db: NotificationDb = prisma,
) {
  return db.notification.create({
    data: { userId, type, title, message, data },
  });
}

export async function getNotificationsForUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}
