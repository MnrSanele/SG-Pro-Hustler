import Link from "next/link";
import { Hammer } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
              <Hammer className="h-5 w-5" />
              <span>{APP_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Professional marketplace for skilled local service providers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">For Requesters</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/post-job" className="hover:text-foreground">Post a Job</Link></li>
              <li><Link href="/providers" className="hover:text-foreground">Find Providers</Link></li>
              <li><Link href="/squads" className="hover:text-foreground">Hire a Squad</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">For Providers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/register" className="hover:text-foreground">Join as Provider</Link></li>
              <li><Link href="/jobs" className="hover:text-foreground">Browse Jobs</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
              <li><Link href="/about" className="hover:text-foreground">How it Works</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
