import { LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <LayoutDashboard className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Active Jobs", value: "0" },
          { title: "Total Reviews", value: "0" },
          { title: "Profile Views", value: "0" },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
