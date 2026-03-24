import { redirect } from "next/navigation";

export const metadata = { title: "Requester Dashboard" };

export default function RequesterDashboardPage() {
  redirect("/requester/jobs");
}
