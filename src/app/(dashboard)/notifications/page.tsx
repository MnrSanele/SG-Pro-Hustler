import { redirect } from "next/navigation";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/actions/notification.actions";
import { auth } from "@/lib/auth";
import { ActionButton } from "@/components/shared/action-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotificationsForUser } from "@/services/notification.service";

export const metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await getNotificationsForUser(session.user.id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Stay on top of applications, assignments, completions, and reviews.</p>
        </div>
        {notifications.some((notification) => !notification.isRead) ? (
          <ActionButton action={markAllNotificationsReadAction} pendingLabel="Marking...">
            Mark all as read
          </ActionButton>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications yet" description="Notifications will appear here as your jobs and reviews progress." />
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{notification.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.isRead ? <Badge>New</Badge> : <Badge variant="outline">Read</Badge>}
                  {!notification.isRead ? (
                    <ActionButton
                      action={markNotificationReadAction.bind(null, notification.id)}
                      pendingLabel="Saving..."
                      variant="outline"
                      size="sm"
                    >
                      Mark read
                    </ActionButton>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {new Date(notification.createdAt).toLocaleString()}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
