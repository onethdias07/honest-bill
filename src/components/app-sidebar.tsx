"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Clock,
  FileText,
  ShieldCheck,
  Leaf,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/time", label: "Track Time", icon: Clock },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/import", label: "Import", icon: Upload },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/charter", label: "Pricing Charter", icon: ShieldCheck },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Leaf className="size-5 text-primary" />
        <span className="font-semibold tracking-tight">HonestBill</span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4">
        <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          Flat pricing. No usage fees. Ever. See the{" "}
          <Link href="/charter" className="font-medium text-primary">
            charter
          </Link>
          .
        </p>
      </div>
    </aside>
  );
}
