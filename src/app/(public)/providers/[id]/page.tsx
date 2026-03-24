import { notFound } from "next/navigation";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { RatingStars } from "@/components/shared/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProviderBySlug } from "@/services/provider.service";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProviderProfilePage({ params }: Props) {
  const { id } = await params;
  const provider = await getProviderBySlug(id);

  if (!provider) notFound();

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
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Main trade: {provider.mainTrade ?? "Not specified"}</p>
              <p>Tagline: {provider.tagline ?? "Not specified"}</p>
              <p>Available now: {provider.availableNow ? "Yes" : "No"}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {provider.reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
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
