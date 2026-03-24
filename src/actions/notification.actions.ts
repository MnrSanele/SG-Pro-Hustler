"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { markAllNotificationsRead, markNotificationRead } from "@/services/notification.service";

export async function markNotificationReadAction(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  await markNotificationRead(notificationId, session.user.id);
  revalidatePath("/notifications");
  revalidatePath("/provider/jobs");
  revalidatePath("/requester/jobs");
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  await markAllNotificationsRead(session.user.id);
  revalidatePath("/notifications");
  revalidatePath("/provider/jobs");
  revalidatePath("/requester/jobs");
  return { success: true };
}
