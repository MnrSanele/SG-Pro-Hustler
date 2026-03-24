import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { EmptyState } from "@/components/shared/empty-state";
import { RatingStars } from "@/components/shared/rating-stars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReviewsDashboard } from "@/services/review.service";

export const metadata = { title: "Reviews" };
export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const reviews = await getReviewsDashboard(session.user.id, session.user.role);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground">See the feedback tied to completed jobs.</p>
      </div>

      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet" description="Reviews will appear here after completed jobs." />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{review.author.name ?? "Reviewer"}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    <Link href={review.job ? `/jobs/${review.job.id}` : "#"} className="hover:underline">
                      {review.job?.title ?? "Completed job"}
                    </Link>
                  </p>
                </div>
                <RatingStars rating={Number(review.overallRating)} showValue />
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{review.comment ?? "No comment provided."}</p>
                <div className="grid gap-2 md:grid-cols-2">
                  <p>Quality: {Number(review.scoreBreakdown?.quality ?? review.overallRating).toFixed(1)}</p>
                  <p>Communication: {Number(review.scoreBreakdown?.communication ?? review.overallRating).toFixed(1)}</p>
                  <p>Punctuality: {Number(review.scoreBreakdown?.punctuality ?? review.overallRating).toFixed(1)}</p>
                  <p>Professionalism: {Number(review.scoreBreakdown?.professionalism ?? review.overallRating).toFixed(1)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
