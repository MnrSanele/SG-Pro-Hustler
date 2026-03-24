import { redirect } from "next/navigation";

export const metadata = { title: "My Provider Profile" };

export default function ProviderDashboardPage() {
  redirect("/provider/jobs");
}
