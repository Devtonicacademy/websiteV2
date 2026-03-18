"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6">
        School LMS Platform
      </h1>
      <p className="max-w-[600px] text-lg text-muted-foreground mb-8">
        Welcome to the multi-tenant Learning Management System. To get started, navigate to your school's dedicated portal.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/devtonic"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Enter Devtonic Academy
        </Link>
        <Link 
          href="/demo-academy"
          className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
        >
          Enter Demo Academy
        </Link>
      </div>
    </div>
  );
}
