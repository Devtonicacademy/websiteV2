"use client";

import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSidebar } from "@/components/sidebar-context";
import { NotificationBell } from "@/components/notification-bell";

export function DashboardTopbar({ breadcrumb = "Dashboard" }: { breadcrumb?: string }) {
  const { user, isAdmin, isInstructor } = useAuth();
  const { toggleOpen, isCollapsed } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-background border-b px-4 md:px-8">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile: always, desktop: only when collapsed */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-9 w-9 md:hidden"
          onClick={toggleOpen}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">
            {breadcrumb.split(" / ")[0]}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5 hidden sm:block">
            {breadcrumb}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="relative w-48 md:w-72 hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search anything"
            className="w-full pl-9 bg-muted/50 border-transparent focus-visible:bg-background rounded-full h-10"
          />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />

          <div className="flex items-center gap-2 md:gap-3 pl-2 border-l">
            <Avatar className="h-8 w-8 md:h-9 md:w-9 border">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.uid || "guest"}`}
                alt="Profile"
              />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none mb-1">
                {user?.displayName || "Admin User"}
              </p>
              <p className="text-xs text-muted-foreground capitalize leading-none">
                {isAdmin ? "Admin" : isInstructor ? "Instructor" : "Student"}
              </p>
            </div>

            <NotificationBell />
          </div>
        </div>
      </div>
    </header>
  );
}
