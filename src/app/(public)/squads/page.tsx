import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

export const metadata = { title: "Browse Squads" };

export default function SquadsPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Browse Squads</h1>
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Squads coming soon"
          description="Find teams of skilled professionals for larger projects."
        />
      </main>
      <Footer />
    </>
  );
}
