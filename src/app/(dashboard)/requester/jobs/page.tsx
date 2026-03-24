import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRequesterJobsForUser } from "@/services/job.service";
import { formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "My Posted Jobs" };
export const dynamic = "force-dynamic";

export default async function RequesterJobsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "REQUESTER") {
    redirect("/provider/jobs");
  }

  const jobs = await getRequesterJobsForUser(session.user.id, session.user.role);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Posted Jobs</h1>
          <p className="text-sm text-muted-foreground">Manage applications and progress each job.</p>
        </div>
        <Button asChild>
          <Link href="/post-job">Post New Job</Link>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            You have not posted any jobs yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{job.category?.name ?? "Uncategorised"}</p>
                </div>
                <Badge variant={job.status === "COMPLETED" ? "secondary" : "default"}>
                  {job.status.replaceAll("_", " ")}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{job._count.applications} application(s)</p>
                  <p>Posted {formatRelativeTime(job.createdAt)}</p>
                  {job.applications[0]?.providerProfile?.user.name ? (
                    <p>Assigned to {job.applications[0].providerProfile.user.name}</p>
                  ) : null}
                </div>
                <Button asChild variant="outline">
                  <Link href={`/requester/jobs/${job.id}`}>View Job</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
