import { notFound } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SquadProfilePage({ params }: Props) {
  const { id } = await params;

  if (!id) notFound();

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Squad Profile: {id}</h1>
        <p className="text-muted-foreground mt-2">Squad details will be displayed here.</p>
      </main>
      <Footer />
    </>
  );
}
