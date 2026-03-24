import { redirect } from "next/navigation";

export const metadata = { title: "My Portfolio" };

export default function ProviderPortfolioPage() {
  redirect("/provider");
}
