import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { JobApplicationForm } from "@/components/jobs/job-application-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { getPublicJobById } from "@/services/job.service";

export const dynamic = "force-dynamic";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const job = await getPublicJobById(id, session?.user?.id);

  if (!job) {
    notFound();
  }

  const canApply = session?.user?.role === "PROVIDER" || session?.user?.role === "SQUAD_LEADER";
  const isRequesterOwner = session?.user?.id === job.requester.id;

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Posted {formatRelativeTime(job.createdAt)}</p>
            <h1 className="text-3xl font-bold">{job.title}</h1>
          </div>
          <Badge variant={job.mode === "INSTANT" ? "default" : "outline"}>
            {job.mode === "INSTANT" ? "Instant hire" : "Quote based"}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Job details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{job.description}</p>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">{job.category?.name ?? "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Urgency</p>
                  <p className="text-sm text-muted-foreground">{job.urgency ?? "Flexible"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{job.location ?? "Remote / flexible"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Budget</p>
                  <p className="text-sm text-muted-foreground">
                    {job.budgetMin || job.budgetMax
                      ? job.budgetMin && job.budgetMax
                        ? `${formatCurrency(Number(job.budgetMin))} – ${formatCurrency(Number(job.budgetMax))}`
                        : job.budgetMin
                          ? `From ${formatCurrency(Number(job.budgetMin))}`
                          : `Up to ${formatCurrency(Number(job.budgetMax))}`
                      : "To be agreed"}
                  </p>
                </div>
              </div>

              {job.requiredSkills.length > 0 ? (
                <div>
                  <p className="text-sm font-medium mb-2">Required skills</p>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Requester</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>{job.requester.name ?? "Requester"}</p>
                <p>Status: {job.status.replaceAll("_", " ")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{job.mode === "INSTANT" ? "Take this job" : "Submit your quote"}</CardTitle>
              </CardHeader>
              <CardContent>
                {!session?.user ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Sign in as a provider to apply for this job.</p>
                    <Button asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </div>
                ) : isRequesterOwner ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">This is your job post.</p>
                    <Button asChild>
                      <Link href={`/requester/jobs/${job.id}`}>View applications</Link>
                    </Button>
                  </div>
                ) : !canApply ? (
                  <p className="text-sm text-muted-foreground">Only providers can apply for jobs.</p>
                ) : job.status !== "OPEN" ? (
                  <p className="text-sm text-muted-foreground">This job is no longer open for applications.</p>
                ) : job.hasApplied ? (
                  <p className="text-sm text-muted-foreground">You have already applied to this job.</p>
                ) : (
                  <JobApplicationForm jobId={job.id} mode={job.mode} />
                )}
              </CardContent>
            </Card>

            {job.status === "ASSIGNED" || job.status === "IN_PROGRESS" || job.status === "IN_REVIEW" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Hiring progress</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  The requester has selected a provider for this job.
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
