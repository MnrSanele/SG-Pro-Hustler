import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { assignProviderAction, confirmJobCompletionAction, rejectApplicationAction } from "@/actions/job.actions";
import { auth } from "@/lib/auth";
import { ActionButton } from "@/components/shared/action-button";
import { RatingStars } from "@/components/shared/rating-stars";
import { ReviewForm } from "@/components/reviews/review-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRequesterJobDetail } from "@/services/job.service";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface RequesterJobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RequesterJobDetailPage({ params }: RequesterJobDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "REQUESTER") {
    redirect("/provider/jobs");
  }

  const job = await getRequesterJobDetail(session.user.id, session.user.role, id);

  if (!job) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Requester dashboard</p>
          <h1 className="text-2xl font-bold">{job.title}</h1>
        </div>
        <Badge variant={job.status === "COMPLETED" ? "secondary" : "default"}>
          {job.status.replaceAll("_", " ")}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p className="whitespace-pre-wrap">{job.description}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <p>Category: {job.category?.name ?? "Not specified"}</p>
            <p>Urgency: {job.urgency ?? "Flexible"}</p>
            <p>Location: {job.location ?? "Not specified"}</p>
            <p>
              Budget:{" "}
              {job.budgetMin || job.budgetMax
                ? job.budgetMin && job.budgetMax
                  ? `${formatCurrency(Number(job.budgetMin))} – ${formatCurrency(Number(job.budgetMax))}`
                  : job.budgetMin
                    ? `From ${formatCurrency(Number(job.budgetMin))}`
                    : `Up to ${formatCurrency(Number(job.budgetMax))}`
                : "To be agreed"}
            </p>
          </div>
          {job.requiredSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {job.requiredSkills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {job.applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No providers have applied yet.</p>
          ) : (
            job.applications.map((application) => {
              const provider = application.providerProfile;

              if (!provider) {
                return null;
              }

              const providerName = provider.user.name ?? "Provider";
              const isAccepted = application.status === "ACCEPTED";

              return (
                <div key={application.id} className="rounded-lg border p-4 space-y-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={provider.user.image ?? undefined} alt={providerName} />
                        <AvatarFallback>{providerName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{providerName}</h3>
                          <Badge variant={provider.idVerificationStatus === "VERIFIED" ? "secondary" : "outline"}>
                            {provider.idVerificationStatus === "VERIFIED" ? "Verified" : provider.idVerificationStatus}
                          </Badge>
                        </div>
                        <RatingStars rating={Number(provider.averageRating)} showValue />
                        <p className="text-sm text-muted-foreground">{provider.bio ?? "No bio added yet."}</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{application.completedJobsCount} completed job(s)</p>
                          <p>{provider.reviewCount} review(s)</p>
                          {application.proposedBudget ? (
                            <p>Quoted: {formatCurrency(Number(application.proposedBudget))}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button asChild variant="outline">
                        <Link href={`/providers/${provider.slug}`}>View profile</Link>
                      </Button>
                    </div>
                  </div>

                  {application.coverLetter ? (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{application.coverLetter}</p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {job.status === "OPEN" && application.status === "PENDING" ? (
                      <>
                        <ActionButton
                          action={assignProviderAction.bind(null, job.id, application.id)}
                          pendingLabel="Assigning..."
                        >
                          Accept provider
                        </ActionButton>
                        <ActionButton
                          action={rejectApplicationAction.bind(null, job.id, application.id)}
                          pendingLabel="Rejecting..."
                          variant="outline"
                        >
                          Reject
                        </ActionButton>
                      </>
                    ) : (
                      <Badge variant={isAccepted ? "secondary" : "outline"}>{application.status}</Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {job.status === "IN_REVIEW" ? (
        <Card>
          <CardHeader>
            <CardTitle>Confirm completion</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionButton
              action={confirmJobCompletionAction.bind(null, job.id)}
              pendingLabel="Confirming..."
            >
              Confirm Job Completion
            </ActionButton>
          </CardContent>
        </Card>
      ) : null}

      {job.status === "COMPLETED" && !job.hasRequesterReview ? (
        <ReviewForm
          jobId={job.id}
          type="REQUESTER_TO_PROVIDER"
          title="Leave a review for the provider"
          description="Share your rating now that the work is complete."
        />
      ) : null}
    </div>
  );
}
