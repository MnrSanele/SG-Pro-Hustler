"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { APP_NAME } from "@/lib/constants";

const navLinks = [
  { href: "/providers", label: "Find Providers" },
  { href: "/squads", label: "Squads" },
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Hammer className="h-6 w-6 text-primary" />
          <span>{APP_NAME}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium py-2"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr />
              <Button variant="outline" asChild>
                <Link href="/login" onClick={() => setOpen(false)}>Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register" onClick={() => setOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
