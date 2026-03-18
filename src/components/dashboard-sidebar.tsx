"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart,
  MessageSquare,
  Calendar,
  CheckSquare,
  PlayCircle,
  Users,
  GraduationCap,
  DollarSign,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";

export function DashboardSidebar({ schoolSlug }: { schoolSlug: string }) {
  const pathname = usePathname();
  const { user, logout, isSuperAdmin, isAdmin, isInstructor } = useAuth();

  const links = [
    { name: "Dashboard", href: `/${schoolSlug}/dashboard`, icon: BarChart },
    { name: "Course Catalog", href: `/${schoolSlug}/courses`, icon: PlayCircle },
    ...(isAdmin || isInstructor
      ? [
        { name: "Manage Courses", href: `/${schoolSlug}/admin/courses`, icon: CheckSquare },
      ]
      : []),
    ...(isAdmin
      ? [
        { name: "Manage Users", href: `/${schoolSlug}/admin/users`, icon: Users },
      ]
      : []),
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background flex flex-col transition-transform -translate-x-full md:translate-x-0">
      <div className="flex h-16 items-center px-6 mb-4 mt-2">
        <Link href={`/${schoolSlug}/dashboard`} className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <img src="https://firebasestorage.googleapis.com/v0/b/devtonic-lms-2.firebasestorage.app/o/Logo_no%20bg.png?alt=media&token=af4099c8-048a-4f73-88ab-7c160a23048b" alt="Devtonic Logo" className="h-8 object-contain" />
          <span className="capitalize text-gray-800 dark:text-gray-100">{schoolSlug.replace(/-/g, " ")}</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted",
                isActive ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* User info & sign out */}
      <div className="p-4 mt-auto border-t">
        {user && (
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {(user.displayName || user.email || "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.displayName || "User"}</p>
              <p className="text-xs text-muted-foreground font-medium">
                {isSuperAdmin ? (
                  <span className="text-amber-600 dark:text-amber-400">Super Admin</span>
                ) : isAdmin ? (
                  "Admin"
                ) : isInstructor ? (
                  "Instructor"
                ) : (
                  "Student"
                )}
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
          onClick={() => logout()}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
