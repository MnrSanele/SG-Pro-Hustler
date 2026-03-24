import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">About {APP_NAME}</h1>
        <p className="text-muted-foreground text-lg mb-6">{APP_DESCRIPTION}</p>
        <div className="prose max-w-none">
          <p>
            {APP_NAME} is a professional marketplace that connects homeowners and businesses
            with skilled tradespeople and artisans in their local area.
          </p>
          <p className="mt-4">
            Whether you need a plumber, painter, electrician, or a full squad for a renovation
            project, we make it easy to find, vet, and hire the right professional for the job.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
