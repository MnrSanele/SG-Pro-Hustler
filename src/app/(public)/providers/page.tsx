import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

export const metadata = { title: "Find Providers" };

export default function ProvidersPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Find Service Providers</h1>
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Providers coming soon"
          description="Browse verified service providers in your area."
        />
      </main>
      <Footer />
    </>
  );
}
