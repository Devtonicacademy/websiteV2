"use client";

import { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckSquare, Square, Plus, StickyNote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Note {
    id: string;
    courseId: string;
    title: string;
    content: string;
    checked: boolean;
    createdAt: Timestamp;
}

interface StudentNotesProps {
    courseId: string;
}

export default function StudentNotes({ courseId }: StudentNotesProps) {
    const { user } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [noteTitle, setNoteTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");

    const notesRef = collection(db, "users", user!.uid, "notes");

    useEffect(() => {
        async function loadNotes() {
            try {
                const q = query(notesRef, orderBy("createdAt", "desc"));
                const snap = await getDocs(q);
                const data = snap.docs
                    .map((d) => ({ id: d.id, ...d.data() } as Note))
                    .filter((n) => n.courseId === courseId);
                setNotes(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadNotes();
    }, [courseId]);

    const handleAdd = async () => {
        if (!noteTitle.trim()) {
            toast.error("Please enter a note title.");
            return;
        }
        setSaving(true);
        try {
            const docRef = await addDoc(notesRef, {
                courseId,
                title: noteTitle,
                content: noteContent,
                checked: false,
                createdAt: serverTimestamp(),
            });
            setNotes((prev) => [
                { id: docRef.id, courseId, title: noteTitle, content: noteContent, checked: false, createdAt: Timestamp.now() },
                ...prev,
            ]);
            toast.success("Note added!");
            setNoteTitle("");
            setNoteContent("");
            setShowForm(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to save note");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (note: Note) => {
        try {
            await updateDoc(doc(db, "users", user!.uid, "notes", note.id), {
                checked: !note.checked,
            });
            setNotes((prev) =>
                prev.map((n) => (n.id === note.id ? { ...n, checked: !n.checked } : n))
            );
        } catch (err) {
            toast.error("Failed to update note");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <StickyNote className="h-5 w-5 text-primary" />
                    My Notes & Checklist
                </h2>
                <Button
                    size="sm"
                    onClick={() => setShowForm((v) => !v)}
                    variant={showForm ? "outline" : "default"}
                >
                    {showForm ? "Cancel" : <><Plus className="h-4 w-4 mr-1" />Add Note</>}
                </Button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="border-primary/30 bg-primary/5">
                            <CardContent className="pt-4 space-y-3">
                                <div className="space-y-1">
                                    <Label>Title <span className="text-destructive">*</span></Label>
                                    <Input
                                        placeholder="e.g. Revise topic: Derivatives"
                                        value={noteTitle}
                                        onChange={(e) => setNoteTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Notes (optional)</Label>
                                    <Textarea
                                        placeholder="Additional details..."
                                        value={noteContent}
                                        onChange={(e) => setNoteContent(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <Button onClick={handleAdd} disabled={saving} className="w-full">
                                    {saving ? "Saving..." : "Save Note"}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading && (
                <div className="text-center py-8 text-muted-foreground animate-pulse">Loading notes...</div>
            )}

            {!loading && notes.length === 0 && !showForm && (
                <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground text-sm">
                    No notes yet. Click "Add Note" to start your personal study checklist.
                </div>
            )}

            <AnimatePresence>
                {notes.map((note) => (
                    <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <Card className={`transition-all ${note.checked ? "opacity-50" : ""}`}>
                            <CardContent className="p-4 flex gap-3 items-start">
                                <button
                                    onClick={() => handleToggle(note)}
                                    className="mt-1 shrink-0 text-primary hover:scale-110 transition-transform"
                                >
                                    {note.checked ? (
                                        <CheckSquare className="h-5 w-5" />
                                    ) : (
                                        <Square className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </button>
                                <div className="flex-1">
                                    <p className={`font-medium ${note.checked ? "line-through text-muted-foreground" : ""}`}>
                                        {note.title}
                                    </p>
                                    {note.content && (
                                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                            {note.content}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
