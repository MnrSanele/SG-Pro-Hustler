import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role === "REQUESTER") {
    redirect("/requester/jobs");
  }

  redirect("/provider/jobs");
}
