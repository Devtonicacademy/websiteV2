"use client";

import { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CalendarDays, Clock, MapPin, Plus, RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Session {
    id: string;
    title: string;
    startDateTime: Timestamp;
    endDateTime: Timestamp;
    recurrenceRule?: string;
    location?: string;
    createdBy: string;
}

interface CourseScheduleProps {
    schoolSlug: string;
    courseId: string;
    courseName: string;
    enrolledStudents: string[];
    modules: { title: string }[];
}

function formatDateTime(ts: Timestamp) {
    const d = ts.toDate();
    return d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default function CourseSchedule({
    schoolSlug,
    courseId,
    courseName,
    enrolledStudents,
    modules,
}: CourseScheduleProps) {
    const { user, isAdmin, isInstructor } = useAuth();
    const canManage = isAdmin || isInstructor;

    const [sessions, setSessions] = useState<Session[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // form state
    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [recurrence, setRecurrence] = useState("none");
    const [location, setLocation] = useState("");

    const sessionsRef = collection(
        db,
        "schools",
        schoolSlug,
        "courses",
        courseId,
        "sessions"
    );

    useEffect(() => {
        async function loadSessions() {
            try {
                const q = query(sessionsRef, orderBy("startDateTime", "asc"));
                const snap = await getDocs(q);
                const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Session));
                setSessions(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingSessions(false);
            }
        }
        loadSessions();
    }, [schoolSlug, courseId]);

    const handleSave = async () => {
        if (!title || !startDate || !startTime || !endTime) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setSaving(true);
        try {
            const startDT = new Date(`${startDate}T${startTime}`);
            const endDT = new Date(`${startDate}T${endTime}`);
            const docRef = await addDoc(sessionsRef, {
                title,
                startDateTime: Timestamp.fromDate(startDT),
                endDateTime: Timestamp.fromDate(endDT),
                recurrenceRule: recurrence === "none" ? null : recurrence,
                location: location || null,
                createdBy: user!.uid,
                createdAt: serverTimestamp(),
            });
            const newSession: Session = {
                id: docRef.id,
                title,
                startDateTime: Timestamp.fromDate(startDT),
                endDateTime: Timestamp.fromDate(endDT),
                recurrenceRule: recurrence === "none" ? undefined : recurrence,
                location: location || undefined,
                createdBy: user!.uid,
            };
            setSessions((prev) => [...prev, newSession].sort((a, b) => a.startDateTime.seconds - b.startDateTime.seconds));
            toast.success("Session scheduled!");
            setShowForm(false);
            setTitle(""); setStartDate(""); setStartTime(""); setEndTime(""); setRecurrence("none"); setLocation("");
        } catch (err: any) {
            toast.error(err.message || "Failed to save session");
        } finally {
            setSaving(false);
        }
    };

    const upcomingSessions = sessions.filter(
        (s) => s.startDateTime.toDate() >= new Date()
    );
    const pastSessions = sessions.filter(
        (s) => s.startDateTime.toDate() < new Date()
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Class Schedule
                </h2>
                {canManage && (
                    <Button size="sm" onClick={() => setShowForm((v) => !v)} variant={showForm ? "outline" : "default"}>
                        {showForm ? <><X className="h-4 w-4 mr-1" />Cancel</> : <><Plus className="h-4 w-4 mr-1" />New Session</>}
                    </Button>
                )}
            </div>

            {/* Create Session Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="border-primary/30 bg-primary/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Schedule New Session</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label>Session Title <span className="text-destructive">*</span></Label>
                                    <Input placeholder="e.g. Week 1: Introduction to Algebra" value={title} onChange={(e) => setTitle(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <Label>Date <span className="text-destructive">*</span></Label>
                                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Start Time <span className="text-destructive">*</span></Label>
                                        <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>End Time <span className="text-destructive">*</span></Label>
                                        <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Recurrence</Label>
                                        <Select value={recurrence} onValueChange={(val: string | null) => setRecurrence(val ?? "none")}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">One-time</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Location (optional)</Label>
                                        <Input placeholder="Room 101, Online..." value={location} onChange={(e) => setLocation(e.target.value)} />
                                    </div>
                                </div>
                                <Button onClick={handleSave} disabled={saving} className="w-full">
                                    {saving ? "Saving..." : "Schedule Session"}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading */}
            {loadingSessions && (
                <div className="text-center py-8 text-muted-foreground animate-pulse">Loading sessions...</div>
            )}

            {/* Upcoming Sessions */}
            {!loadingSessions && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Upcoming ({upcomingSessions.length})
                    </h3>
                    {upcomingSessions.length === 0 ? (
                        <div className="border border-dashed rounded-lg p-6 text-center text-muted-foreground text-sm">
                            No upcoming sessions scheduled.
                            {canManage && " Click 'New Session' to schedule one."}
                        </div>
                    ) : (
                        <AnimatePresence>
                            {upcomingSessions.map((s) => (
                                <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                    <Card className="border-primary/20 bg-primary/5 hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div>
                                                    <p className="font-semibold">{s.title}</p>
                                                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDateTime(s.startDateTime)} → {s.endDateTime.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                        {s.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" /> {s.location}
                                                            </span>
                                                        )}
                                                        {s.recurrenceRule && (
                                                            <span className="flex items-center gap-1">
                                                                <RefreshCw className="h-3 w-3" /> {s.recurrenceRule}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {canManage && (
                                                    <Link href={`/${schoolSlug}/courses/${courseId}/attendance?sessionId=${s.id}&sessionTitle=${encodeURIComponent(s.title)}`}>
                                                        <Button size="sm" variant="outline">Mark Attendance</Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            )}

            {/* Past Sessions */}
            {!loadingSessions && pastSessions.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Past Sessions ({pastSessions.length})
                    </h3>
                    {pastSessions.map((s) => (
                        <Card key={s.id} className="opacity-60 hover:opacity-80 transition-opacity">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <p className="font-medium">{s.title}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDateTime(s.startDateTime)}
                                            {s.location && <> · <MapPin className="h-3 w-3" /> {s.location}</>}
                                        </p>
                                    </div>
                                    {canManage && (
                                        <Link href={`/${schoolSlug}/courses/${courseId}/attendance?sessionId=${s.id}&sessionTitle=${encodeURIComponent(s.title)}`}>
                                            <Button size="sm" variant="ghost">View / Edit Log</Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
