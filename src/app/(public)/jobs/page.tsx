import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { EmptyState } from "@/components/shared/empty-state";
import { Briefcase } from "lucide-react";

export const metadata = { title: "Browse Jobs" };

export default function JobsPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>
        <EmptyState
          icon={<Briefcase className="h-12 w-12" />}
          title="Jobs coming soon"
          description="Browse available jobs posted by requesters."
        />
      </main>
      <Footer />
    </>
  );
}
