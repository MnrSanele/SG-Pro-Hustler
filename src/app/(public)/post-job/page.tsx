import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { PostJobForm } from "@/components/jobs/post-job-form";
import { auth } from "@/lib/auth";
import { getActiveCategories } from "@/services/category.service";
import { redirect } from "next/navigation";

export const metadata = { title: "Post a Job" };
export const dynamic = "force-dynamic";

export default async function PostJobPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "REQUESTER") {
    redirect("/provider/jobs");
  }

  const categories = await getActiveCategories();

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Post a Job</h1>
        <p className="text-muted-foreground mb-6">Describe what you need done and connect with skilled providers.</p>
        <PostJobForm categories={categories.map((category) => ({ id: category.id, name: category.name }))} />
      </main>
      <Footer />
    </>
  );
}
