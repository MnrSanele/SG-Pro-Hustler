import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { ProfileStrength } from "@/components/shared/profile-strength";
import { RatingStars } from "@/components/shared/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProviderBySlug } from "@/services/provider.service";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ project?: string }>;
}

export default async function ProviderProfilePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { project: selectedProjectId } = await searchParams;
  const provider = await getProviderBySlug(id);

  if (!provider) notFound();

  const selectedProject =
    provider.portfolio.find((project) => project.id === selectedProjectId) ?? provider.portfolio[0] ?? null;

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{provider.user.name ?? "Provider"}</h1>
            <p className="text-muted-foreground">{provider.mainTrade ?? "Service provider"}</p>
          </div>
          <div className="space-y-1 text-right">
            <RatingStars rating={Number(provider.averageRating)} showValue size="lg" />
            <p className="text-sm text-muted-foreground">
              {provider.reviewCount} review(s) · {provider.completedJobsCount} completed job(s)
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>{provider.bio ?? "No bio available yet."}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={provider.idVerificationStatus === "VERIFIED" ? "secondary" : "outline"}>
                  {provider.idVerificationStatus === "VERIFIED" ? "Verified" : provider.idVerificationStatus}
                </Badge>
                <Badge variant="outline">{provider.reviewCount} reviews</Badge>
                <Badge variant="outline">{provider.completedJobsCount} completed jobs</Badge>
              </div>
              {provider.serviceAreas.length > 0 ? (
                <div>
                  <p className="font-medium text-foreground mb-2">Service areas</p>
                  <div className="flex flex-wrap gap-2">
                    {provider.serviceAreas.map((area) => (
                      <Badge key={area} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Main trade: {provider.mainTrade ?? "Not specified"}</p>
              <p>Tagline: {provider.tagline ?? "Not specified"}</p>
              <p>Available now: {provider.availableNow ? "Yes" : "No"}</p>
              <ProfileStrength score={provider.credibility.score} checklist={provider.credibility.checklist} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {provider.portfolio.length === 0 ? (
              <EmptyState
                title="No portfolio projects yet"
                description="This provider has not published portfolio work yet."
              />
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {provider.portfolio.map((project) => (
                    <Link
                      key={project.id}
                      href={`/providers/${provider.slug}?project=${project.id}`}
                      className="rounded-lg border p-3 space-y-3 hover:shadow-sm transition-shadow"
                    >
                      {project.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.coverImageUrl} alt={project.title} className="h-40 w-full rounded object-cover" />
                      ) : null}
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground">{project.area ?? "Location not specified"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.rolePerformed ? <Badge variant="secondary">{project.rolePerformed}</Badge> : null}
                        {project.budgetRange ? <Badge variant="outline">{project.budgetRange}</Badge> : null}
                      </div>
                    </Link>
                  ))}
                </div>

                {selectedProject ? (
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedProject.title}</h3>
                        <p className="text-sm text-muted-foreground">{selectedProject.area ?? "Location not specified"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.rolePerformed ? <Badge variant="secondary">{selectedProject.rolePerformed}</Badge> : null}
                        {selectedProject.budgetRange ? <Badge variant="outline">{selectedProject.budgetRange}</Badge> : null}
                        {selectedProject.dateCompleted ? (
                          <Badge variant="outline">
                            Completed {new Date(selectedProject.dateCompleted).toLocaleDateString()}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.description ?? "No project description provided."}
                    </p>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {selectedProject.media.map((media) => (
                        <div key={media.id} className="space-y-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={media.url} alt={selectedProject.title} className="h-40 w-full rounded object-cover" />
                          {media.isCover ? <Badge variant="secondary">Cover image</Badge> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {provider.reviews.length === 0 ? (
              <EmptyState title="No reviews yet" description="This provider has not received any public reviews yet." />
            ) : (
              provider.reviews.map((review) => (
                <div key={review.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{review.author.name ?? "Customer"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <RatingStars rating={Number(review.overallRating)} showValue />
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment ?? "No comment provided."}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
