import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { EmptyState } from "@/components/shared/empty-state";
import { Briefcase } from "lucide-react";
import { JobCard } from "@/components/shared/job-card";
import { Button } from "@/components/ui/button";
import { getActiveCategories } from "@/services/category.service";
import { getJobs } from "@/services/job.service";

export const metadata = { title: "Browse Jobs" };
export const dynamic = "force-dynamic";

interface JobsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    urgency?: string;
    location?: string;
  }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const [categories, jobsResult] = await Promise.all([
    getActiveCategories(),
    getJobs({
      q: params.q,
      category: params.category,
      urgency: params.urgency,
      location: params.location,
      limit: 50,
    }),
  ]);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-2 mb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Browse Jobs</h1>
            <p className="text-muted-foreground">Open jobs are loaded directly from the database.</p>
          </div>
          <Button asChild>
            <Link href="/post-job">Post a Job</Link>
          </Button>
        </div>

        <form className="grid gap-4 rounded-lg border p-4 md:grid-cols-4 mb-6">
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search title or description"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <select
            name="category"
            defaultValue={params.category ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            name="urgency"
            defaultValue={params.urgency ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All urgency levels</option>
            <option value="immediate">Immediate</option>
            <option value="this_week">This week</option>
            <option value="flexible">Flexible</option>
          </select>
          <input
            name="location"
            defaultValue={params.location ?? ""}
            placeholder="Filter by location"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div className="md:col-span-4 flex gap-2">
            <Button type="submit">Apply Filters</Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/jobs">Reset</Link>
            </Button>
          </div>
        </form>

        {jobsResult.jobs.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="h-12 w-12" />}
            title="No jobs match your filters"
            description="Try another category, location, or urgency."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobsResult.jobs.map((job) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                description={job.description}
                location={job.location}
                budgetMin={job.budgetMin ? Number(job.budgetMin) : null}
                budgetMax={job.budgetMax ? Number(job.budgetMax) : null}
                mode={job.mode}
                status={job.status}
                urgency={job.urgency}
                categoryName={job.category?.name}
                createdAt={job.createdAt}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
