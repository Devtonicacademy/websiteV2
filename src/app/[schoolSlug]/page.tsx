"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, UserPlus } from "lucide-react";
import Link from "next/link";

export default function SchoolLandingPage({
  params,
}: {
  params: Promise<{ schoolSlug: string }>;
}) {
  const { schoolSlug } = use(params);

  // In a real app, we would fetch courses from Firestore where schoolId matches
  const demoCourses = [
    { id: "1", title: "Introduction to React", description: "Learn the basics of modern React" },
    { id: "2", title: "Advanced Mathematics", description: "Calculus and linear algebra fundamentals" },
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-4">
          Welcome to <span className="text-primary capitalize">{schoolSlug.replace("-", " ")}</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our catalog of available courses. Sign in to track your progress and manage your classes.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href={`/${schoolSlug}/auth/login`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8">
            <UserPlus className="mr-2 h-5 w-5" />
            Sign In
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <BookOpen className="mr-2" />
          Course Catalog
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
              whileHover={{ scale: 1.03 }}
            >
              <Card className="h-full flex flex-col hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-4">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
