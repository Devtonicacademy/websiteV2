"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    doc,
    getDoc,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, ClipboardList, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

interface StudentStatus {
    uid: string;
    displayName: string;
    status: AttendanceStatus;
}

interface LogEntry {
    id: string;
    sessionId: string;
    sessionTitle: string;
    date: Timestamp;
    studentStatuses: StudentStatus[];
    topicsCovered: string;
    comment: string;
    loggedBy: string;
    loggedAt: Timestamp;
}

const statusColors: Record<AttendanceStatus, string> = {
    present: "text-green-600 dark:text-green-400",
    absent: "text-red-500 dark:text-red-400",
    late: "text-yellow-600 dark:text-yellow-400",
    excused: "text-blue-500 dark:text-blue-400",
};

const statusBg: Record<AttendanceStatus, string> = {
    present: "bg-green-500/10 border-green-500/30",
    absent: "bg-red-500/10 border-red-500/30",
    late: "bg-yellow-500/10 border-yellow-500/30",
    excused: "bg-blue-500/10 border-blue-500/30",
};

export default function AttendancePage({
    params,
}: {
    params: Promise<{ schoolSlug: string; courseId: string }>;
}) {
    const { schoolSlug, courseId } = use(params);
    const { user, isAdmin, isInstructor } = useAuth();
    const canManage = isAdmin || isInstructor;
    const searchParams = useSearchParams();
    const router = useRouter();

    const sessionId = searchParams.get("sessionId");
    const sessionTitle = searchParams.get("sessionTitle") || "Class Session";

    const [course, setCourse] = useState<any>(null);
    const [enrolledStudentNames, setEnrolledStudentNames] = useState<{ uid: string; displayName: string }[]>([]);
    const [studentStatuses, setStudentStatuses] = useState<StudentStatus[]>([]);
    const [topicsCovered, setTopicsCovered] = useState("");
    const [comment, setComment] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [existingLogs, setExistingLogs] = useState<LogEntry[]>([]);

    // Load course + enrolled students
    useEffect(() => {
        async function load() {
            try {
                const courseDoc = await getDoc(doc(db, "schools", schoolSlug, "courses", courseId));
                if (!courseDoc.exists()) return;
                const courseData = { id: courseDoc.id, ...courseDoc.data() } as any;
                setCourse(courseData);

                const enrolled: string[] = courseData.enrolledStudents || [];
                // Fetch display names for each enrolled student
                const studentFetches = enrolled.map(async (uid) => {
                    const snap = await getDoc(doc(db, "schools", schoolSlug, "users", uid));
                    const name = snap.exists() ? snap.data().displayName || snap.data().email || uid : uid;
                    return { uid, displayName: name };
                });
                const students = await Promise.all(studentFetches);
                setEnrolledStudentNames(students);
                setStudentStatuses(students.map((s) => ({ ...s, status: "present" as AttendanceStatus })));

                // Load existing logs for this session
                if (sessionId) {
                    const logsRef = collection(db, "schools", schoolSlug, "courses", courseId, "attendanceLogs");
                    const q = query(logsRef, where("sessionId", "==", sessionId), orderBy("loggedAt", "desc"));
                    const snap = await getDocs(q);
                    setExistingLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LogEntry)));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [schoolSlug, courseId, sessionId]);

    const setStatus = (uid: string, status: AttendanceStatus) => {
        setStudentStatuses((prev) =>
            prev.map((s) => (s.uid === uid ? { ...s, status } : s))
        );
    };

    const handleSave = async () => {
        if (!sessionId) {
            toast.error("No session selected.");
            return;
        }
        setSaving(true);
        try {
            const logsRef = collection(
                db, "schools", schoolSlug, "courses", courseId, "attendanceLogs"
            );
            await addDoc(logsRef, {
                sessionId,
                sessionTitle,
                date: Timestamp.now(),
                studentStatuses,
                topicsCovered,
                comment,
                loggedBy: user!.uid,
                loggedAt: serverTimestamp(),
            });
            toast.success("Attendance logged successfully!");
            router.push(`/${schoolSlug}/courses/${courseId}`);
        } catch (err: any) {
            toast.error(err.message || "Failed to save attendance");
        } finally {
            setSaving(false);
        }
    };

    if (!canManage) {
        return (
            <div className="p-8 text-center text-destructive">
                You do not have permission to log attendance.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-12 text-center text-muted-foreground animate-pulse">
                Loading attendance form...
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <Link
                href={`/${schoolSlug}/courses/${courseId}`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Course
            </Link>

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardList className="h-6 w-6 text-primary" />
                        Attendance Log
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Session: <span className="font-medium">{decodeURIComponent(sessionTitle)}</span>
                        {course && <> · <span className="font-medium">{course.title}</span></>}
                    </p>
                </div>

                {/* Student Status Rows */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            Students ({studentStatuses.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {studentStatuses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No students are enrolled in this course yet.</p>
                        ) : (
                            studentStatuses.map((s) => (
                                <div
                                    key={s.uid}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${statusBg[s.status]}`}
                                >
                                    <p className="font-medium">{s.displayName}</p>
                                    <Select
                                        value={s.status}
                                        onValueChange={(val) => setStatus(s.uid, val as AttendanceStatus)}
                                    >
                                        <SelectTrigger className={`w-32 h-8 text-xs font-semibold border-0 bg-transparent ${statusColors[s.status]}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="present">✅ Present</SelectItem>
                                            <SelectItem value="absent">❌ Absent</SelectItem>
                                            <SelectItem value="late">⏰ Late</SelectItem>
                                            <SelectItem value="excused">📋 Excused</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Topics & Comments */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Session Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label>Topics Covered</Label>
                            <Textarea
                                placeholder="e.g. Introduction to Algebra, Solving Linear Equations..."
                                value={topicsCovered}
                                onChange={(e) => setTopicsCovered(e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Comments / Follow-up Actions</Label>
                            <Textarea
                                placeholder="e.g. Homework: Pages 12–15. Next class: Quadratic Equations."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
                    {saving ? "Saving..." : <><CheckCircle className="h-4 w-4 mr-2" />Submit Attendance Log</>}
                </Button>

                {/* Previous Logs */}
                {existingLogs.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Previous Logs for This Session ({existingLogs.length})
                        </h3>
                        {existingLogs.map((log) => (
                            <Card key={log.id} className="opacity-70">
                                <CardContent className="p-4 text-sm space-y-2">
                                    <p className="text-muted-foreground">
                                        Logged: {log.loggedAt?.toDate?.().toLocaleString() ?? "N/A"}
                                    </p>
                                    {log.topicsCovered && (
                                        <p><span className="font-medium">Topics:</span> {log.topicsCovered}</p>
                                    )}
                                    {log.comment && (
                                        <p><span className="font-medium">Notes:</span> {log.comment}</p>
                                    )}
                                    <div className="grid grid-cols-2 gap-1 pt-1">
                                        {log.studentStatuses?.map((s: StudentStatus) => (
                                            <div key={s.uid} className="flex items-center gap-2 text-xs">
                                                <span className={statusColors[s.status]}>●</span>
                                                <span>{s.displayName}</span>
                                                <span className={`capitalize ${statusColors[s.status]}`}>{s.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
