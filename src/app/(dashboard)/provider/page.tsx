import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { EmptyState } from "@/components/shared/empty-state";
import { ProfileStrength } from "@/components/shared/profile-strength";
import { PortfolioProjectForm } from "@/components/provider/portfolio-project-form";
import { ProviderProfileForm } from "@/components/provider/provider-profile-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveCategoriesWithSkills } from "@/services/category.service";
import { getProviderDashboard } from "@/services/provider.service";

export const metadata = { title: "My Provider Profile" };
export const dynamic = "force-dynamic";

export default async function ProviderDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!["PROVIDER", "SQUAD_LEADER"].includes(session.user.role)) {
    redirect("/requester/jobs");
  }

  const [provider, categories] = await Promise.all([
    getProviderDashboard(session.user.id),
    getActiveCategoriesWithSkills(),
  ]);

  if (!provider) {
    redirect("/register?role=provider");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Provider Profile</h1>
          <p className="text-sm text-muted-foreground">Strengthen trust signals, update your profile, and build a credible portfolio.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/providers/${provider.slug}`} className="text-sm text-primary hover:underline">
            View public profile
          </Link>
          <Link href="/provider/jobs" className="text-sm text-primary hover:underline">
            View jobs
          </Link>
        </div>
      </div>

      <ProfileStrength score={provider.credibility.score} checklist={provider.credibility.checklist} />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProviderProfileForm
              initialProfile={{
                user: {
                  image: provider.user.image,
                  phone: provider.user.phone,
                },
                bio: provider.bio,
                tagline: provider.tagline,
                mainTrade: provider.mainTrade,
                pricingModel: provider.pricingModel,
                hourlyRate: provider.hourlyRate ? Number(provider.hourlyRate) : null,
                dailyRate: provider.dailyRate ? Number(provider.dailyRate) : null,
                availableNow: provider.availableNow,
                emergencyAvailable: provider.emergencyAvailable,
                yearsExperience: provider.yearsExperience,
                serviceAreas: provider.serviceAreas,
                languages: provider.languages,
                skills: provider.skills.map((skill) => ({
                  skillId: skill.skillId,
                  proficiencyRank: skill.proficiencyRank,
                })),
              }}
              categories={categories.map((category) => ({
                id: category.id,
                name: category.name,
                skills: category.skills.map((skill) => ({ id: skill.id, name: skill.name })),
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trust signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Moderation:</span>
              <Badge variant="outline">{provider.moderationStatus}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Verification:</span>
              <Badge variant={provider.idVerificationStatus === "VERIFIED" ? "secondary" : "outline"}>{provider.idVerificationStatus}</Badge>
            </div>
            <p>{provider.reviewCount} review(s)</p>
            <p>{provider.portfolio.length} portfolio project(s)</p>
            <p>{provider.skills.length} skill(s)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add portfolio project</CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioProjectForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          {provider.portfolio.length === 0 ? (
            <EmptyState
              title="No portfolio projects yet"
              description="Upload completed work to make your profile more credible."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {provider.portfolio.map((project) => (
                <div key={project.id} className="rounded-lg border p-3 space-y-3">
                  {project.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.coverImageUrl} alt={project.title} className="h-40 w-full rounded object-cover" />
                  ) : null}
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground">{project.area ?? "Location not specified"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {project.rolePerformed ? <Badge variant="secondary">{project.rolePerformed}</Badge> : null}
                    {project.budgetRange ? <Badge variant="outline">{project.budgetRange}</Badge> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
