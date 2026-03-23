import Link from "next/link";
import { ArrowRight, Shield, Star, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { CATEGORIES } from "@/constants/categories";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-background to-secondary/20 py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              {APP_TAGLINE}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {APP_NAME} connects you with verified, skilled artisans in your area.
              From painting to plumbing, find the right professional for every job.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" asChild>
                <Link href="/providers">
                  Find a Provider <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/post-job">Post a Job</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Browse by Trade</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {CATEGORIES.map((cat) => (
                <Link key={cat.slug} href={`/providers?category=${cat.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer text-center">
                    <CardContent className="p-4">
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <p className="text-sm font-medium">{cat.name}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-secondary/20">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10">Why Choose {APP_NAME}?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Shield className="h-6 w-6" />, title: "Verified Providers", desc: "All artisans are vetted and ID-verified for your safety." },
                { icon: <Star className="h-6 w-6" />, title: "Rated & Reviewed", desc: "Real reviews from real customers to help you decide." },
                { icon: <Users className="h-6 w-6" />, title: "Squads Available", desc: "Hire a full team for larger renovation projects." },
                { icon: <Zap className="h-6 w-6" />, title: "Instant or Quote", desc: "Get instant hires or competitive quotes for your job." },
              ].map((f) => (
                <Card key={f.title}>
                  <CardContent className="p-6">
                    <div className="text-primary mb-3">{f.icon}</div>
                    <h3 className="font-semibold mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Are You a Skilled Artisan?</h2>
            <p className="text-muted-foreground mb-6">
              Join {APP_NAME} and connect with clients who need your expertise.
              Build your portfolio, get reviews, and grow your business.
            </p>
            <Button size="lg" asChild>
              <Link href="/register?role=provider">
                Join as a Provider <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
