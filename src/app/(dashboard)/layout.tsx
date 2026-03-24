import Link from "next/link";
import { LayoutDashboard, User, Briefcase, Star, Bell, Settings, Users, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/lib/constants";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth.actions";

const requesterNavItems = [
  { href: "/requester/jobs", label: "My Jobs", icon: Briefcase },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

const providerNavItems = [
  { href: "/provider/jobs", label: "Jobs", icon: Briefcase },
  { href: "/provider", label: "My Profile", icon: User },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/squad", label: "My Squad", icon: Users },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const navItems = session?.user?.role === "REQUESTER" ? requesterNavItems : providerNavItems;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-background hidden md:flex flex-col">
        <div className="p-4 border-b">
          <Link href="/" className="font-bold text-lg">{APP_NAME}</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Separator />
        <div className="p-4">
          <form action={logoutAction}>
            <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors w-full text-muted-foreground">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
