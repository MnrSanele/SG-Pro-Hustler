import { updateProviderModerationAction, updateProviderVerificationAction } from "@/actions/admin.actions";
import { ActionButton } from "@/components/shared/action-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProvidersForAdmin } from "@/services/admin.service";

export const metadata = { title: "Manage Providers" };
export const dynamic = "force-dynamic";

export default async function AdminProvidersPage() {
  const providers = await getProvidersForAdmin();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Providers</h1>
        <p className="text-sm text-muted-foreground">Approve, reject, and verify provider trust signals.</p>
      </div>

      {providers.length === 0 ? (
        <EmptyState title="No providers found" description="Provider accounts will appear here once created." />
      ) : (
        <div className="space-y-4">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{provider.user.name ?? "Provider"}</CardTitle>
                  <p className="text-sm text-muted-foreground">{provider.user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{provider.moderationStatus}</Badge>
                  <Badge variant={provider.idVerificationStatus === "VERIFIED" ? "secondary" : "outline"}>
                    {provider.idVerificationStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
                  <p>{provider._count.portfolio} portfolio project(s)</p>
                  <p>{provider._count.reviews} review(s)</p>
                  <p>{provider.skills.length} skill(s)</p>
                  <p>Phone verified: {provider.user.phoneVerified ? "Yes" : "No"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    action={updateProviderModerationAction.bind(null, provider.id, "APPROVED")}
                    pendingLabel="Approving..."
                    size="sm"
                  >
                    Approve
                  </ActionButton>
                  <ActionButton
                    action={updateProviderModerationAction.bind(null, provider.id, "REJECTED")}
                    pendingLabel="Rejecting..."
                    variant="outline"
                    size="sm"
                  >
                    Reject
                  </ActionButton>
                  <ActionButton
                    action={updateProviderVerificationAction.bind(null, provider.id, "VERIFIED")}
                    pendingLabel="Verifying..."
                    variant="secondary"
                    size="sm"
                  >
                    Mark Verified
                  </ActionButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
