import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export const metadata = { title: "Post a Job" };

export default function PostJobPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Post a Job</h1>
        <p className="text-muted-foreground mb-6">Describe what you need done and connect with skilled providers.</p>
        <p className="text-sm text-muted-foreground">Job posting form coming soon.</p>
      </main>
      <Footer />
    </>
  );
}
