import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllJobsForAdmin } from "@/services/admin.service";

export const metadata = { title: "Manage Jobs" };
export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const jobs = await getAllJobsForAdmin();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Jobs</h1>
        <p className="text-sm text-muted-foreground">Review all marketplace jobs and their current lifecycle states.</p>
      </div>

      {jobs.length === 0 ? (
        <EmptyState title="No jobs found" description="Jobs will appear here once requesters begin posting work." />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {job.requester.name ?? "Requester"} · {job.category?.name ?? "General"}
                  </p>
                </div>
                <Badge>{job.status.replaceAll("_", " ")}</Badge>
              </CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-3 text-sm text-muted-foreground">
                <p>{job._count.applications} application(s)</p>
                <p>{job._count.reviews} review(s)</p>
                <p>Posted {new Date(job.createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
