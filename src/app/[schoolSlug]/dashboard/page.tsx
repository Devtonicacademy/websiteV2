"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Search, Book, LogOut } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { DashboardTopbar } from "@/components/dashboard-topbar";

export default function DashboardPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { user, loading, logout, isAdmin, isInstructor, isStudent } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${schoolSlug}/auth/login`);
    }
  }, [user, loading, router, schoolSlug]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="flex flex-col flex-1 w-full">
      <DashboardTopbar breadcrumb="Dashboard / Overview" />
      <div className="p-8 max-w-7xl mx-auto w-full">

      {(isAdmin || isInstructor) && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 shadow-sm border-border/50">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Courses by Category</CardTitle>
                <span className="text-xs text-muted-foreground">This Week</span>
              </CardHeader>
              <CardContent className="flex items-center gap-4 pt-4">
                <div className="relative w-24 h-24 rounded-full border-8 border-primary/20 flex items-center justify-center">
                  <span className="absolute left-0 top-0 w-full h-full rounded-full border-8 border-t-primary border-r-yellow-400 border-b-primary/10 border-l-blue-400 transform -rotate-45" />
                  <div className="text-center flex flex-col items-center justify-center bg-background rounded-full w-20 h-20 z-10 absolute">
                    <span className="text-[10px] text-muted-foreground leading-tight">Total Course</span>
                    <span className="text-lg font-bold leading-tight">250</span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-400"/>Design</div><span className="text-muted-foreground">32%</span></div>
                  <div className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-400"/>Marketing</div><span className="text-muted-foreground">24%</span></div>
                  <div className="flex items-center justify-between text-xs"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"/>Web Dev</div><span className="text-muted-foreground">22%</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 shadow-sm border-border/50">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Course Rating</CardTitle>
                <span className="text-xs text-muted-foreground">This Week</span>
              </CardHeader>
              <CardContent className="pt-4 flex items-end justify-between h-[120px]">
                <div className="flex flex-col items-center gap-2 w-1/4"><span className="text-[10px] text-yellow-500 font-bold">★ 4.7</span><div className="w-8 h-[80%] bg-pink-300 rounded-t-md hidden sm:block"></div><span className="text-[10px] text-muted-foreground">Design</span></div>
                <div className="flex flex-col items-center gap-2 w-1/4"><span className="text-[10px] text-yellow-500 font-bold">★ 4.8</span><div className="w-8 h-[100%] bg-pink-400 rounded-t-md hidden sm:block"></div><span className="text-[10px] text-muted-foreground">Marktg</span></div>
                <div className="flex flex-col items-center gap-2 w-1/4"><span className="text-[10px] text-yellow-500 font-bold">★ 4.6</span><div className="w-8 h-[70%] bg-yellow-400 rounded-t-md hidden sm:block"></div><span className="text-[10px] text-muted-foreground">Web Dev</span></div>
                <div className="flex flex-col items-center gap-2 w-1/4"><span className="text-[10px] text-yellow-500 font-bold">★ 4.8</span><div className="w-8 h-[90%] bg-pink-300 rounded-t-md hidden sm:block"></div><span className="text-[10px] text-muted-foreground">Business</span></div>
              </CardContent>
            </Card>

            <Card className="col-span-1 shadow-sm border-border/50">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">Development Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs"><span className="font-medium">Python for Beginners</span><span className="text-yellow-500 font-medium">★ 4.8 <span className="text-muted-foreground font-normal">(1.4k)</span></span></div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-yellow-400 w-[90%]"></div></div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs"><span className="font-medium">JavaScript Essentials</span><span className="text-yellow-500 font-medium">★ 4.7 <span className="text-muted-foreground font-normal">(1.1k)</span></span></div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-yellow-400 w-[85%]"></div></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl">
              <Button variant="ghost" size="sm" className="rounded-lg bg-background shadow-sm px-6 h-8 text-xs font-medium">All</Button>
              <Button variant="ghost" size="sm" className="rounded-lg px-6 h-8 text-xs text-muted-foreground">Active</Button>
              <Button variant="ghost" size="sm" className="rounded-lg px-6 h-8 text-xs text-muted-foreground">Draft</Button>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground font-medium flex block sm:hidden md:block">All Categories</span>
              <Link href={`/${schoolSlug}/admin/courses/new`} className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Course
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="overflow-hidden border-border/50 hover:shadow-md transition-all group flex flex-col p-1.5 rounded-2xl">
              <div className="h-40 w-full bg-pink-100 dark:bg-pink-950 rounded-xl mb-3 relative overflow-hidden flex items-center justify-center">
                <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/50 backdrop-blur-sm text-[10px] font-medium px-2 py-1 rounded-md">Beginner</div>
                <span className="text-5xl opacity-80 mix-blend-multiply dark:mix-blend-screen">🎨</span>
              </div>
              <CardContent className="p-3 pt-0 flex flex-col flex-1">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                  <span>Web Development</span>
                  <span className="flex items-center gap-1"><Book className="h-3 w-3"/> 20 Mod</span>
                </div>
                <h3 className="font-semibold text-sm leading-tight mb-4 group-hover:text-primary transition-colors">Graphic Design Fundamentals</h3>
                <div className="mt-auto flex items-center justify-between border-t pt-3">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-background"></div>
                    <div className="w-6 h-6 rounded-full bg-pink-100 border-2 border-background"></div>
                    <div className="text-[10px] font-medium pl-3">317+</div>
                  </div>
                  <span className="font-bold text-pink-500">$99</span>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/50 hover:shadow-md transition-all group flex flex-col p-1.5 rounded-2xl">
              <div className="h-40 w-full bg-blue-50 dark:bg-blue-950 rounded-xl mb-3 relative overflow-hidden flex items-center justify-center">
                <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/50 backdrop-blur-sm text-[10px] font-medium px-2 py-1 rounded-md">Intermediate</div>
                <span className="text-5xl opacity-80 mix-blend-multiply dark:mix-blend-screen">🎯</span>
              </div>
              <CardContent className="p-3 pt-0 flex flex-col flex-1">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                  <span>Marketing</span>
                  <span className="flex items-center gap-1"><Book className="h-3 w-3"/> 18 Mod</span>
                </div>
                <h3 className="font-semibold text-sm leading-tight mb-4 group-hover:text-primary transition-colors">Digital Marketing Mastery</h3>
                <div className="mt-auto flex items-center justify-between border-t pt-3">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 border-2 border-background"></div>
                    <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-background"></div>
                    <div className="text-[10px] font-medium pl-3">277+</div>
                  </div>
                  <span className="font-bold text-pink-500">$79</span>
                </div>
              </CardContent>
            </Card>

            <Card className="flex items-center justify-center border-dashed h-[320px] text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer rounded-2xl bg-muted/10">
              <Link href={`/${schoolSlug}/admin/courses/new`} className="flex flex-col items-center w-full h-full justify-center">
                <PlusCircle className="h-8 w-8 mb-2 opacity-50 text-primary" />
                <span className="font-medium text-sm">Create New Course</span>
              </Link>
            </Card>
          </div>
        </div>
      )}

      {isStudent && (
        <StudentEnrollments schoolSlug={schoolSlug} userUid={user.uid} />
      )}
      </div>
    </div>
  );
}

function StudentEnrollments({ schoolSlug, userUid }: { schoolSlug: string, userUid: string }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchEnrolled() {
      try {
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        
        const q = query(
          collection(db, "schools", schoolSlug, "courses"),
          where("enrolledStudents", "array-contains", userUid)
        );
        const snapshot = await getDocs(q);
        setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Failed to fetch enrollments", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEnrolled();
  }, [schoolSlug, userUid]);

  if (loading) return <div className="py-10 animate-pulse text-sm text-muted-foreground">Loading your courses...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Your Enrollments</h2>
      {courses.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col items-center justify-center py-12 px-6 text-center border-dashed col-span-full">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Book className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">No active courses</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
              You haven't enrolled in any courses yet. Check out the catalog to find something new to learn!
            </p>
            <Link href={`/${schoolSlug}/courses`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">Browse Catalog</Link>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => {
            const completedModules = course.modules?.filter((m: any) => m.completedBy?.includes(userUid)).length || 0;
            const totalModules = course.modules?.length || 0;
            const progress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
            
            return (
              <Card key={course.id} className="h-full flex flex-col hover:border-primary transition-colors hover:shadow-sm">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="mt-auto pt-4 flex flex-col gap-4 border-t border-border/50">
                  <div className="text-sm font-medium">
                    Progress: {progress}% ({completedModules}/{totalModules} modules)
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <Link href={`/${schoolSlug}/courses/${course.id}`} className="mt-2 inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    Continue Learning
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
