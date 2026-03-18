"use client";

import { Search, Bell, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardTopbar({ breadcrumb = "Dashboard" }: { breadcrumb?: string }) {
  const { user, isAdmin, isInstructor } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-background border-b px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{breadcrumb.split(" / ")[0]}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {breadcrumb}
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-72 hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search anything"
            className="w-full pl-9 bg-muted/50 border-transparent focus-visible:bg-background rounded-full h-10"
          />
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="flex items-center gap-3 pl-2 border-l">
            <Avatar className="h-9 w-9 border hidden sm:block">
              <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.uid || 'guest'}`} alt="Profile" />
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none mb-1">{user?.displayName || "Admin User"}</p>
              <p className="text-xs text-muted-foreground capitalize leading-none">
                {isAdmin ? "Admin" : isInstructor ? "Instructor" : "Student"}
              </p>
            </div>

            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 ml-1">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 -ml-1">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
