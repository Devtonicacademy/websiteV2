"use client";

import { use, useEffect, useState } from "react";
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { Award, Share2, Download, ExternalLink, Calendar, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { generateCertificate } from "@/lib/generate-certificate";
import Link from "next/link";

interface CompletedCourse {
  id: string;
  title: string;
  description: string;
  certificateId: string | null;
  issuedAt: Date | null;
}

export default function CompletedCoursesPage({
  params,
}: {
  params: Promise<{ schoolSlug: string }>;
}) {
  const { schoolSlug } = use(params);
  const { user, isStudent } = useAuth();
  
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingCerts, setGeneratingCerts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user || !isStudent) return;

    async function fetchCompletedCourses() {
      setLoading(true);
      try {
        // Fetch all courses where student is enrolled
        const q = query(
          collection(db, "schools", schoolSlug, "courses"),
          where("enrolledStudents", "array-contains", user!.uid)
        );
        const snap = await getDocs(q);
        
        const completed: CompletedCourse[] = [];

        for (const docSnap of snap.docs) {
          const course = { id: docSnap.id, ...docSnap.data() } as any;
          
          const allModules = course.sections ? course.sections.flatMap((s: any) => s.modules || []) : (course.modules || []);
          const completedCount = allModules.filter((m: any) => m.completedBy?.includes(user!.uid)).length || 0;
          const totalModules = allModules.length || 0;
        
          const allQuizzes = course.sections ? course.sections.filter((s: any) => s.quiz && s.quiz.questions?.length > 0) : [];
          const passedQuizzesCount = allQuizzes.filter((s: any) => s.quiz.passedBy?.some((p: any) => p.uid === user!.uid)).length || 0;
          
          const totalItems = totalModules + allQuizzes.length;
          const completedItems = completedCount + passedQuizzesCount;
          const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
          const isFullyCompleted = progressPercent === 100 && totalItems > 0;

          if (isFullyCompleted) {
            // Check if certificate exists
            const certId = `${schoolSlug}-${course.id}-${user!.uid}`;
            const certRef = doc(db, "certificates", certId);
            const certSnap = await getDoc(certRef);
            
            let issuedAt = new Date();
            let hasCert = false;

            if (certSnap.exists()) {
              issuedAt = certSnap.data().issuedAt?.toDate() || new Date();
              hasCert = true;
            }

            completed.push({
              id: course.id,
              title: course.title,
              description: course.description || "",
              certificateId: hasCert ? certId : null,
              issuedAt: hasCert ? issuedAt : null,
            });
          }
        }
        setCompletedCourses(completed);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCompletedCourses();
  }, [user, isStudent, schoolSlug]);

  if (!user || !isStudent) return null;

  const handleGenerateCertificate = async (course: CompletedCourse) => {
    setGeneratingCerts(prev => ({ ...prev, [course.id]: true }));
    try {
      const certId = `${schoolSlug}-${course.id}-${user.uid}`;
      const certRef = doc(db, "certificates", certId);
      
      const payload = {
        certificateId: certId,
        schoolSlug,
        courseId: course.id,
        courseName: course.title,
        studentId: user.uid,
        studentName: user.displayName || user.email || "Student",
        issuedAt: serverTimestamp()
      };
      
      await setDoc(certRef, payload, { merge: true });
      
      setCompletedCourses(prev => prev.map(c => 
        c.id === course.id 
          ? { ...c, certificateId: certId, issuedAt: new Date() } 
          : c
      ));
      
      toast.success("Certificate generated and saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate public certificate");
    } finally {
      setGeneratingCerts(prev => ({ ...prev, [course.id]: false }));
    }
  };

  const handleDownload = (course: CompletedCourse) => {
    generateCertificate({
      studentName: user.displayName || user.email || "Student",
      courseName: course.title,
      completionDate: (course.issuedAt || new Date()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      schoolName: schoolSlug.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
    });
  };

  const copyPublicLink = (certId: string) => {
    const url = `${window.location.origin}/verify/${certId}`;
    navigator.clipboard.writeText(url);
    toast.success("Public link copied to clipboard");
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full">
      <DashboardTopbar breadcrumb="Completed Courses" />
      <main className="p-8 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Qualifications</h1>
          <p className="text-muted-foreground">View your completed courses and manage your certificates.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-64 bg-muted/20" />
            ))}
          </div>
        ) : completedCourses.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="border border-dashed rounded-xl p-12 text-center bg-muted/10">
              <Award className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No completed courses yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You haven't fully completed any courses yet. Once you finish all modules and quizzes in a course, your certificates will appear here.
              </p>
              <Link href={`/${schoolSlug}/courses`}>
                <Button>Browse Course Catalog</Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedCourses.map((course) => (
              <motion.div key={course.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="h-full flex flex-col border-primary/20 bg-gradient-to-br from-background to-muted/20">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg">
                        <Award className="w-8 h-8" />
                      </div>
                      {course.issuedAt && (
                        <div className="text-xs font-semibold px-2 py-1 bg-green-500/10 text-green-600 rounded-full flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {course.issuedAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 leading-tight">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="text-sm border-t pt-4 text-muted-foreground">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-primary/70" />
                        <span>100% Curriculum Completed</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3 border-t bg-muted/5 pt-4">
                    {!course.certificateId ? (
                      <Button
                        className="w-full gap-2 "
                        onClick={() => handleGenerateCertificate(course)}
                        disabled={generatingCerts[course.id]}
                      >
                        {generatingCerts[course.id] ? "Generating..." : "Claim Certificate"}
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline"
                          className="w-full gap-2 text-primary border-primary/30 hover:bg-primary/5"
                          onClick={() => handleDownload(course)}
                        >
                          <Download className="w-4 h-4" /> Download PDF
                        </Button>
                        <div className="flex w-full gap-2">
                          <Button 
                            variant="secondary" 
                            className="flex-1 gap-1 border border-border/50 text-xs"
                            onClick={() => copyPublicLink(course.certificateId!)}
                          >
                            <Share2 className="w-3.5 h-3.5" /> Share
                          </Button>
                          <Link href={`/verify/${course.certificateId}`} target="_blank" className="flex-1">
                            <Button variant="secondary" className="w-full gap-1 border border-border/50 text-xs text-blue-600 hover:text-blue-700">
                              <ExternalLink className="w-3.5 h-3.5" /> View Public
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
