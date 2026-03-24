import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { getAdminStats, getFlaggedReviews } from "@/services/admin.service";

export const metadata = { title: "Admin Overview" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [stats, flaggedReviews] = await Promise.all([getAdminStats(), getFlaggedReviews()]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Moderation and trust signals at a glance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Users", value: stats.totalUsers },
          { label: "Providers", value: stats.totalProviders },
          { label: "Jobs", value: stats.totalJobs },
          { label: "Pending Providers", value: stats.pendingProviders },
          { label: "Flagged Reviews", value: stats.flaggedReviews },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flagged reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {flaggedReviews.length === 0 ? (
            <EmptyState title="No flagged reviews" description="There are currently no reviews flagged for moderation." />
          ) : (
            <div className="space-y-4">
              {flaggedReviews.map((review) => (
                <div key={review.id} className="rounded-lg border p-4">
                  <p className="font-medium">{review.author.name ?? "Reviewer"} → {review.subjectUser?.name ?? "User"}</p>
                  <p className="text-sm text-muted-foreground">{review.comment ?? "No comment provided."}</p>
                  {review.job ? (
                    <Link href={`/admin/jobs`} className="text-xs text-primary hover:underline">
                      View jobs moderation
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
