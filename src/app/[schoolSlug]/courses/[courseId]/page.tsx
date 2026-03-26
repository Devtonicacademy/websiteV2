"use client";

import { use, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  arrayUnion,
  Timestamp,
  addDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, CheckCircle, Circle, PlayCircle, FileText, File, Award } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";
import CourseSchedule from "@/components/course/course-schedule";
import StudentNotes from "@/components/course/student-notes";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { generateCertificate } from "@/lib/generate-certificate";

interface AttendanceLogEntry {
  id: string;
  sessionId: string;
  sessionTitle: string;
  date: Timestamp;
  studentStatuses: { uid: string; displayName: string; status: string }[];
  topicsCovered: string;
  comment: string;
  loggedAt: Timestamp;
}

const statusColors: Record<string, string> = {
  present: "text-green-600 dark:text-green-400",
  absent: "text-red-500 dark:text-red-400",
  late: "text-yellow-600 dark:text-yellow-400",
  excused: "text-blue-500 dark:text-blue-400",
};

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ schoolSlug: string; courseId: string }>;
}) {
  const { schoolSlug, courseId } = use(params);
  const { user, isAdmin, isInstructor, isStudent } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<"none" | "pending" | "approved" | "declined">("none");
  const [myAttendanceLogs, setMyAttendanceLogs] = useState<AttendanceLogEntry[]>([]);
  const [allLogs, setAllLogs] = useState<AttendanceLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const ref = doc(db, "schools", schoolSlug, "courses", courseId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setCourse({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Failed to load course", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [schoolSlug, courseId]);

  // Check if student has a pending/approved/declined enrollment request
  useEffect(() => {
    if (!user || !isStudent) return;
    async function checkEnrollmentRequest() {
      try {
        const q = query(
          collection(db, "schools", schoolSlug, "enrollmentRequests"),
          where("courseId", "==", courseId),
          where("studentId", "==", user!.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setEnrollmentStatus(snap.docs[0].data().status as any);
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkEnrollmentRequest();
  }, [user, isStudent, schoolSlug, courseId]);

  // Load attendance logs
  useEffect(() => {
    if (!user) return;
    async function loadLogs() {
      setLogsLoading(true);
      try {
        const logsRef = collection(
          db, "schools", schoolSlug, "courses", courseId, "attendanceLogs"
        );
        const q = query(logsRef, orderBy("loggedAt", "desc"));
        const snap = await getDocs(q);
        const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceLogEntry));
        setAllLogs(logs);

        if (isStudent) {
          setMyAttendanceLogs(
            logs.filter((l) =>
              l.studentStatuses?.some((s) => s.uid === user!.uid)
            )
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLogsLoading(false);
      }
    }
    loadLogs();
  }, [user, schoolSlug, courseId, isStudent]);

  if (loading) return <div className="py-20 text-center animate-pulse">Loading course details...</div>;
  if (!course) return <div className="py-20 text-center">Course not found.</div>;

  const isEnrolled = user && course.enrolledStudents?.includes(user.uid);
  const canManage = isAdmin || isInstructor;

  const handleEnroll = async () => {
    if (!user) { toast.error("Please log in to enroll"); return; }
    setEnrolling(true);
    try {
      // Submit enrollment request instead of directly enrolling
      await addDoc(collection(db, "schools", schoolSlug, "enrollmentRequests"), {
        courseId,
        courseName: course.title,
        studentId: user.uid,
        studentName: user.displayName || user.email || "Student",
        studentEmail: user.email || "",
        status: "pending",
        requestedAt: serverTimestamp(),
      });
      setEnrollmentStatus("pending");
      toast.success("Enrollment request submitted! Waiting for admin approval.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit enrollment request");
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModuleCompletion = async (moduleIndex: number, isCompleted: boolean) => {
    if (!user || !isEnrolled) return;
    try {
      // 1. Update the flat modules list (legacy compatibility)
      const newModules = [...(course.modules || [])];
      if (moduleIndex >= 0 && moduleIndex < newModules.length) {
        const mod = newModules[moduleIndex];
        if (!mod.completedBy) mod.completedBy = [];
        if (isCompleted) {
          mod.completedBy = mod.completedBy.filter((id: string) => id !== user.uid);
        } else {
          mod.completedBy.push(user.uid);
        }
      }

      // 2. Update the nested sections structure (new canonical structure)
      const newSections = course.sections ? JSON.parse(JSON.stringify(course.sections)) : [];
      if (newSections.length > 0) {
        // Find the module in sections by title and content to match (robust way)
        const targetMod = newModules[moduleIndex];
        if (targetMod) {
          newSections.forEach((s: any) => {
            s.modules?.forEach((m: any) => {
              if (m.title === targetMod.title && m.content === targetMod.content) {
                m.completedBy = targetMod.completedBy;
              }
            });
          });
        }
      }

      const ref = doc(db, "schools", schoolSlug, "courses", courseId);
      await updateDoc(ref, {
        modules: newModules,
        sections: newSections.length > 0 ? newSections : undefined
      });

      setCourse({ ...course, modules: newModules, sections: newSections.length > 0 ? newSections : undefined });
      if (!isCompleted) toast.success("Module marked as complete!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update progress");
    }
  };

  const allModules = course.sections ? course.sections.flatMap((s: any) => s.modules || []) : (course.modules || []);
  const completedCount = allModules.filter((m: any) => m.completedBy?.includes(user?.uid)).length || 0;
  const totalModules = allModules.length || 0;

  const allQuizzes = course.sections ? course.sections.filter((s: any) => s.quiz && s.quiz.questions?.length > 0) : [];
  const passedQuizzesCount = allQuizzes.filter((s: any) => s.quiz.passedBy?.some((p: any) => p.uid === user?.uid)).length || 0;
  
  const totalItems = totalModules + allQuizzes.length;
  const completedItems = completedCount + passedQuizzesCount;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isFullyCompleted = progressPercent === 100 && totalItems > 0;

  // Build tabs list based on role
  const tabs = [
    { id: "content", label: "Content", show: true },
    { id: "schedule", label: "Schedule", show: true },
    { id: "attendance", label: canManage ? "Attendance" : "My Attendance", show: isEnrolled || canManage },
    { id: "notes", label: "My Notes", show: isEnrolled && isStudent },
  ].filter((t) => t.show);

  return (
    <div className="flex flex-col flex-1 w-full">
      <DashboardTopbar breadcrumb={`Course Catalog / ${course.title}`} />
      <div className="p-8 max-w-5xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">{course.title}</h1>
            <p className="text-lg text-muted-foreground whitespace-pre-wrap">{course.description}</p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            {isEnrolled ? (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-primary mb-1">Your Progress</div>
                <div className="text-2xl font-bold">{progressPercent}%</div>
                <div className="w-full bg-primary/20 h-2 rounded-full mt-2 mb-3 overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                {isFullyCompleted && isStudent && (
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full gap-2 mt-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-md border-0"
                    onClick={() => {
                      generateCertificate({
                        studentName: user?.displayName || user?.email || "Student",
                        courseName: course.title,
                        completionDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
                        schoolName: schoolSlug.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
                      });
                    }}
                  >
                    <Award className="w-4 h-4" /> Download Certificate
                  </Button>
                )}
              </div>
            ) : canManage ? (
              <Link href={`/${schoolSlug}/admin/courses/new`}>
                <Button variant="outline" size="lg">Edit Course</Button>
              </Link>
            ) : enrollmentStatus === "pending" ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">⏳ Pending Approval</div>
                <p className="text-xs text-muted-foreground">Your enrollment request is awaiting admin review.</p>
              </div>
            ) : enrollmentStatus === "declined" ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">❌ Request Declined</div>
                <p className="text-xs text-muted-foreground">Contact administration for more information.</p>
              </div>
            ) : (
              <Button size="lg" className="w-full md:w-auto" onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? "Submitting..." : "Request Enrollment"}
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="content">
          <TabsList className="flex w-full mb-6">
            {tabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
            ))}
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center">
                  <BookOpen className="mr-2 h-6 w-6 text-primary" /> Curriculum
                </h2>
                {isEnrolled && (
                  <div className="text-sm font-medium text-muted-foreground">
                    {completedCount} / {totalModules} Completed
                  </div>
                )}
              </div>

              {course.sections && course.sections.length > 0 ? (
                <div className="space-y-10">
                  {course.sections.map((section: any, sIdx: number) => (
                    <div key={sIdx} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                          {sIdx + 1}
                        </div>
                        <h3 className="text-xl font-bold tracking-tight">{section.title}</h3>
                      </div>

                      <div className="grid gap-4">
                        {section.modules?.map((mod: any, mIdx: number) => {
                          // Calculate global index by summing modules in previous sections
                          const previousModulesCount = course.sections
                            .slice(0, sIdx)
                            .reduce((acc: number, s: any) => acc + (s.modules?.length || 0), 0);
                          const finalIndex = previousModulesCount + mIdx;
                          const isCompleted = user && mod.completedBy?.includes(user.uid);

                          return (
                            <Card key={mIdx} className={`overflow-hidden transition-all duration-300 hover:shadow-md ${isCompleted ? "bg-muted/30 border-primary/20" : "hover:border-primary/30"}`}>
                              <CardHeader className="py-4 flex flex-row items-center gap-4">
                                {isEnrolled && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toggleModuleCompletion(finalIndex, Boolean(isCompleted));
                                    }}
                                    className="shrink-0 transition-all hover:scale-110 focus:outline-none z-10"
                                  >
                                    {isCompleted ? (
                                      <CheckCircle className="h-6 w-6 text-primary fill-primary/10" />
                                    ) : (
                                      <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                                    )}
                                  </button>
                                )}
                                <Link
                                  href={`/${schoolSlug}/courses/${courseId}/modules/${finalIndex}`}
                                  className="flex-1 group"
                                >
                                  <CardTitle className="text-base font-semibold flex items-center gap-3 group-hover:text-primary transition-colors">
                                    <div className="p-1.5 rounded-md bg-background border border-border/50 shadow-sm group-hover:border-primary/30 transition-colors">
                                      {mod.type === "video" ? (
                                        <PlayCircle className="h-4 w-4 text-blue-500" />
                                      ) : mod.type === "pdf" ? (
                                        <File className="h-4 w-4 text-red-500" />
                                      ) : (
                                        <FileText className="h-4 w-4 text-green-500" />
                                      )}
                                    </div>
                                    {mod.title}
                                  </CardTitle>
                                </Link>
                              </CardHeader>
                              {isEnrolled && (
                                <Link href={`/${schoolSlug}/courses/${courseId}/modules/${finalIndex}`}>
                                  <CardContent className="pt-0 pb-5 px-6 border-t border-border/5 text-sm cursor-pointer hover:bg-muted/10 transition-colors group">
                                    <div className="mt-4 flex items-center justify-between">
                                      {mod.type === "video" && mod.content.includes("http") ? (
                                        <div className="inline-flex items-center gap-2 text-primary font-medium group-hover:underline">
                                          <PlayCircle className="h-4 w-4" />
                                          Watch Video Lesson
                                        </div>
                                      ) : (
                                        <div className="text-muted-foreground line-clamp-2 italic">
                                          {mod.content.substring(0, 100)}...
                                        </div>
                                      )}
                                      <div className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        Open Lesson →
                                      </div>
                                    </div>
                                  </CardContent>
                                </Link>
                              )}
                            </Card>
                          );
                        })}
                        
                        {section.quiz && section.quiz.questions?.length > 0 && (
                          <Card className={`overflow-hidden transition-all duration-300 hover:shadow-md ${user && section.quiz.passedBy?.some((p:any) => p.uid === user?.uid) ? "bg-green-500/10 border-green-500/30" : "hover:border-primary/30"}`}>
                            <CardHeader className="py-4 flex flex-row items-center gap-4">
                              {isEnrolled && (
                                <div className="shrink-0 z-10">
                                  {user && section.quiz.passedBy?.some((p:any) => p.uid === user?.uid) ? (
                                    <CheckCircle className="h-6 w-6 text-green-500 fill-green-500/10" />
                                  ) : (
                                    <Circle className="h-6 w-6 text-muted-foreground transition-colors" />
                                  )}
                                </div>
                              )}
                              <Link href={`/${schoolSlug}/courses/${courseId}/quiz/${sIdx}`} className="flex-1 group">
                                <CardTitle className="text-base font-semibold flex items-center gap-3 lg:group-hover:text-primary transition-colors">
                                  <div className="p-1.5 rounded-md bg-background border border-border/50 shadow-sm group-hover:border-primary/30 transition-colors">
                                    <FileText className="h-4 w-4 text-indigo-500" />
                                  </div>
                                   Section Quiz
                                </CardTitle>
                              </Link>
                            </CardHeader>
                            {isEnrolled && (
                               <Link href={`/${schoolSlug}/courses/${courseId}/quiz/${sIdx}`}>
                                 <CardContent className="pt-0 pb-5 px-6 border-t border-border/5 text-sm cursor-pointer hover:bg-muted/10 transition-colors group">
                                   <div className="mt-4 flex items-center justify-between">
                                     <div className="inline-flex items-center gap-2 text-indigo-500 font-medium group-hover:underline">
                                       Take Quiz ({section.quiz.questions.length} questions)
                                     </div>
                                     <div className="text-xs font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                       Start →
                                     </div>
                                   </div>
                                 </CardContent>
                               </Link>
                            )}
                          </Card>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {course.modules?.map((mod: any, i: number) => {
                    const isCompleted = user && mod.completedBy?.includes(user.uid);
                    return (
                      <Card key={i} className={`transition-all duration-300 ${isCompleted ? "bg-muted/30 border-primary/30" : "hover:border-primary/30"}`}>
                        <CardHeader className="py-4 flex flex-row items-center gap-4">
                          {isEnrolled && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                toggleModuleCompletion(i, Boolean(isCompleted));
                              }}
                              className="shrink-0 hover:scale-110 transition-transform focus:outline-none z-10"
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-6 w-6 text-primary fill-primary/10" />
                              ) : (
                                <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                              )}
                            </button>
                          )}
                          <Link
                            href={`/${schoolSlug}/courses/${courseId}/modules/${i}`}
                            className="flex-1 group"
                          >
                            <CardTitle className="text-lg flex items-center gap-3 font-semibold group-hover:text-primary transition-colors">
                              <div className="p-1.5 rounded-md bg-background border border-border/50 shadow-sm group-hover:border-primary/30 transition-colors">
                                {mod.type === "video" ? (
                                  <PlayCircle className="h-4 w-4 text-blue-500" />
                                ) : mod.type === "pdf" ? (
                                  <File className="h-4 w-4 text-red-500" />
                                ) : (
                                  <FileText className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                              {mod.title}
                            </CardTitle>
                          </Link>
                        </CardHeader>
                        {isEnrolled && (
                          <Link href={`/${schoolSlug}/courses/${courseId}/modules/${i}`}>
                            <CardContent className="pt-0 pb-5 px-6 border-t border-border/5 text-sm cursor-pointer hover:bg-muted/10 transition-colors group">
                              <div className="mt-4 flex items-center justify-between">
                                {mod.type === "video" && mod.content.includes("http") ? (
                                  <div className="inline-flex items-center gap-2 text-primary font-medium group-hover:underline">
                                    <PlayCircle className="h-4 w-4" />
                                    Watch Video Lesson
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground line-clamp-2 italic">
                                    {mod.content.substring(0, 100)}...
                                  </div>
                                )}
                                <div className="text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                  Open Lesson →
                                </div>
                              </div>
                            </CardContent>
                          </Link>
                        )}
                      </Card>
                    );
                  })}
                  {(!course.modules || course.modules.length === 0) && (
                    <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/5">
                      <BookOpen className="h-10 w-10 mx-auto mb-4 opacity-20" />
                      <p>No modules have been added to this course yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <CourseSchedule
              schoolSlug={schoolSlug}
              courseId={courseId}
              courseName={course.title}
              enrolledStudents={course.enrolledStudents || []}
              modules={course.modules || []}
            />
          </TabsContent>

          {/* Attendance Tab */}
          {(isEnrolled || canManage) && (
            <TabsContent value="attendance">
              {canManage ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Attendance History</h2>
                    <p className="text-sm text-muted-foreground">{allLogs.length} log{allLogs.length !== 1 ? "s" : ""} total</p>
                  </div>
                  {logsLoading && <p className="text-center animate-pulse">Loading logs...</p>}
                  {!logsLoading && allLogs.length === 0 && (
                    <div className="border border-dashed rounded-lg p-6 text-center text-muted-foreground text-sm">
                      No attendance has been logged yet. Go to the Schedule tab and click "Mark Attendance" on a session.
                    </div>
                  )}
                  {allLogs.map((log) => (
                    <Card key={log.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{log.sessionTitle}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Logged: {log.loggedAt?.toDate?.().toLocaleString() ?? "N/A"}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        {log.topicsCovered && <p><strong>Topics:</strong> {log.topicsCovered}</p>}
                        {log.comment && <p><strong>Notes:</strong> {log.comment}</p>}
                        <div className="grid grid-cols-2 gap-1">
                          {log.studentStatuses?.map((s) => (
                            <div key={s.uid} className="flex items-center gap-2 text-xs">
                              <span className={statusColors[s.status] || "text-muted-foreground"}>●</span>
                              <span>{s.displayName}</span>
                              <span className={`capitalize ${statusColors[s.status] || ""}`}>{s.status}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // Student view — show only their own attendance
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">My Attendance</h2>
                  {logsLoading && <p className="text-center animate-pulse">Loading...</p>}
                  {!logsLoading && myAttendanceLogs.length === 0 && (
                    <div className="border border-dashed rounded-lg p-6 text-center text-muted-foreground text-sm">
                      No attendance has been recorded for you yet.
                    </div>
                  )}
                  {myAttendanceLogs.map((log) => {
                    const myStatus = log.studentStatuses?.find((s) => s.uid === user?.uid);
                    return (
                      <Card key={log.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{log.sessionTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.date?.toDate?.().toLocaleDateString() ?? ""}
                            </p>
                            {log.topicsCovered && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Topics: {log.topicsCovered}
                              </p>
                            )}
                            {log.comment && (
                              <p className="text-xs text-muted-foreground">
                                📋 {log.comment}
                              </p>
                            )}
                          </div>
                          {myStatus && (
                            <span className={`text-sm font-semibold capitalize ${statusColors[myStatus.status] || ""}`}>
                              {myStatus.status}
                            </span>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          )}

          {/* Notes Tab — Students Only */}
          {isEnrolled && isStudent && (
            <TabsContent value="notes">
              <StudentNotes courseId={courseId} />
            </TabsContent>
          )}
        </Tabs>
      </motion.div>
      </div>
    </div>
  );
}
