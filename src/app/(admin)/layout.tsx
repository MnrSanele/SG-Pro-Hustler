import Link from "next/link";
import { Shield, LayoutDashboard, Users, Briefcase, AlertCircle, Tag } from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/providers", label: "Providers", icon: Users },
  { href: "/admin/squads", label: "Squads", icon: Users },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/disputes", label: "Disputes", icon: AlertCircle },
  { href: "/admin/taxonomy", label: "Taxonomy", icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-background hidden md:flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-500" />
          <Link href="/admin" className="font-bold text-lg">Admin Panel</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map((item) => (
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
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
