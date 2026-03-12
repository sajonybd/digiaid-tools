"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Wrench,
  Users,
  ShieldAlert,
  FileText,
  Package,
  ShoppingCart,
  Ticket,
  Banknote,
  ListOrdered
} from "lucide-react";
import { useSession } from "next-auth/react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin' || session?.user?.email === "admin@example.com"; 

  const navItems = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Tools",
      href: "/dashboard/tools",
      icon: Wrench,
    },
    {
      title: "Billing",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const adminItems = [
    {
       title: "Admin Overview",
       href: "/admin",
       icon: ShieldAlert,
    },
    {
       title: "Orders",
       href: "/admin/orders",
       icon: ShoppingCart,
    },
    {
       title: "Coupons",
       href: "/admin/coupons",
       icon: Ticket,
    },
    {
       title: "Exchange Rates",
       href: "/admin/exchange-rates",
       icon: Banknote,
    },
    {
      title: "Manage Tools",
      href: "/admin/tools",
      icon: Wrench,
    },
    {
       title: "CMS Pages",
       href: "/admin/pages",
       icon: FileText,
    },
    {
       title: "Manage Users",
       href: "/admin/users",
       icon: Users,
    },
    {
       title: "Manage Categories",
       href: "/admin/categories",
       icon: ListOrdered,
     },
    {
       title: "Site Settings",
       href: "/admin/settings",
       icon: Settings,
     },
    {
       title: "Manage Packages",
       href: "/admin/packages",
       icon: Package,
    }
  ];

  return (
    <nav className="grid items-start gap-2 p-4">
      {session?.user && (
        <div className="px-4 py-6 mb-2 bg-primary/5 rounded-xl border border-primary/10">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold text-primary">UID: {(session.user as any).customId || '....'}</span>
            <span className="text-base font-semibold truncate text-foreground">{session.user.name}</span>
            <span className="text-xs text-muted-foreground truncate">{session.user.email}</span>
          </div>
        </div>
      )}
      <div className="px-2 py-2">
         <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
            Menu
          </h2>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {isAdmin && (
         <div className="px-2 py-2 mt-4">
           <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-primary">
              Admin
            </h2>
           <div className="space-y-1">
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
           </div>
         </div>
      )}
    </nav>
  );
}
