import Link from "next/link";
import { redirect } from "next/navigation";
import { markJobReadyForCompletionAction, startJobAction } from "@/actions/job.actions";
import { auth } from "@/lib/auth";
import { ActionButton } from "@/components/shared/action-button";
import { ReviewForm } from "@/components/reviews/review-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProviderJobsDashboard } from "@/services/job.service";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Provider Jobs" };
export const dynamic = "force-dynamic";

export default async function ProviderJobsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!["PROVIDER", "SQUAD_LEADER"].includes(session.user.role)) {
    redirect("/requester/jobs");
  }

  const data = await getProviderJobsDashboard(session.user.id, session.user.role);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Provider Jobs</h1>
          <p className="text-sm text-muted-foreground">Track your applications and active jobs.</p>
        </div>
        <Button asChild>
          <Link href="/jobs">Browse Open Jobs</Link>
        </Button>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Assigned Jobs</h2>
        {data.assignedJobs.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              You do not have any assigned jobs yet.
            </CardContent>
          </Card>
        ) : (
          data.assignedJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Requester: {job.requester.name ?? "Requester"} · {job.category?.name ?? "General"}
                  </p>
                </div>
                <Badge variant={job.status === "COMPLETED" ? "secondary" : "default"}>
                  {job.status.replaceAll("_", " ")}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{job.description}</p>
                <div className="flex flex-wrap gap-2">
                  {job.status === "ASSIGNED" ? (
                    <ActionButton action={startJobAction.bind(null, job.id)} pendingLabel="Starting...">
                      Mark In Progress
                    </ActionButton>
                  ) : null}
                  {job.status === "IN_PROGRESS" ? (
                    <ActionButton
                      action={markJobReadyForCompletionAction.bind(null, job.id)}
                      pendingLabel="Updating..."
                    >
                      Mark Ready for Completion
                    </ActionButton>
                  ) : null}
                  <Button asChild variant="outline">
                    <Link href={`/jobs/${job.id}`}>Open Job</Link>
                  </Button>
                </div>

                {job.status === "COMPLETED" && !job.hasProviderReview ? (
                  <ReviewForm
                    jobId={job.id}
                    type="PROVIDER_TO_REQUESTER"
                    title="Review the requester"
                    description="Leave feedback for the requester after completion."
                  />
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">My Applications</h2>
        {data.applications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              You have not applied to any jobs yet.
            </CardContent>
          </Card>
        ) : (
          data.applications.map((application) => (
            <Card key={application.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{application.job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {application.job.requester.name ?? "Requester"} · {application.job.category?.name ?? "General"}
                  </p>
                </div>
                <Badge variant={application.status === "ACCEPTED" ? "secondary" : "outline"}>
                  {application.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{application.job.description}</p>
                {application.proposedBudget ? (
                  <p>Your quote: {formatCurrency(Number(application.proposedBudget))}</p>
                ) : null}
                {application.coverLetter ? <p>{application.coverLetter}</p> : null}
                <Button asChild variant="outline">
                  <Link href={`/jobs/${application.jobId}`}>Open Job</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
