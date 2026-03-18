"use client";

import { use, useState } from "react";
import { collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";

// ─── Sample Data ──────────────────────────────────────────────────────────────

const sampleInstructors = [
  { id: "instructor-001", displayName: "Mrs. Adaeze Obi", email: "adaeze.obi@devtonic.edu", role: "instructor" as const },
  { id: "instructor-002", displayName: "Mr. Emeka Nwosu", email: "emeka.nwosu@devtonic.edu", role: "instructor" as const },
];

const sampleStudents = [
  { id: "student-001", displayName: "Chukwuemeka Eze", email: "emeka.eze@student.local", role: "student" as const },
  { id: "student-002", displayName: "Amara Okafor", email: "amara.okafor@student.local", role: "student" as const },
  { id: "student-003", displayName: "Bola Adeyemi", email: "bola.adeyemi@student.local", role: "student" as const },
  { id: "student-004", displayName: "Fatima Al-Hassan", email: "fatima.alhassan@student.local", role: "student" as const },
  { id: "student-005", displayName: "Tosin Owolabi", email: "tosin.owolabi@student.local", role: "student" as const },
];

const mockCourses = [
  {
    title: "Introduction to React",
    description: "Learn the fundamentals of building modern UIs with React and Next.js.",
    instructorId: "instructor-001",
    category: "Technology",
    modules: [
      { title: "Components & Props", type: "video", content: "https://www.youtube.com/watch?v=dGcsHMXbSOA", completedBy: [] },
      { title: "State & Lifecycle", type: "text", content: "State allows React components to dynamically re-render when data changes.", completedBy: [] },
      { title: "Hooks Deep Dive", type: "video", content: "https://www.youtube.com/watch?v=O6P86uwfdR0", completedBy: [] },
    ],
    enrolledStudents: ["student-001", "student-002", "student-003"],
  },
  {
    title: "Advanced Mathematics",
    description: "A comprehensive journey through calculus and linear algebra for senior students.",
    instructorId: "instructor-002",
    category: "Mathematics",
    modules: [
      { title: "Limits and Continuity", type: "text", content: "The formal definition of a limit describes how functions behave near a point.", completedBy: [] },
      { title: "Derivatives", type: "pdf", content: "https://example.com/derivatives.pdf", completedBy: [] },
      { title: "Integration Techniques", type: "text", content: "Integration is the reverse process of differentiation.", completedBy: [] },
    ],
    enrolledStudents: ["student-002", "student-004", "student-005"],
  },
  {
    title: "World History: 20th Century",
    description: "Analyzing global conflicts, revolutions, and geopolitical shifts from 1900–2000.",
    instructorId: "instructor-001",
    category: "History",
    modules: [
      { title: "WWI: Causes & Consequences", type: "text", content: "Militarism, Alliances, Imperialism, Nationalism — the four causes.", completedBy: [] },
      { title: "The Great Depression", type: "video", content: "https://www.youtube.com/watch?v=H7mAp3oxBEk", completedBy: [] },
    ],
    enrolledStudents: ["student-001", "student-003", "student-004", "student-005"],
  },
  {
    title: "English Language & Composition",
    description: "Develop strong writing, reading comprehension, and communication skills.",
    instructorId: "instructor-002",
    category: "English",
    modules: [
      { title: "Essay Structure", type: "text", content: "A well-structured essay has an introduction, body paragraphs, and a conclusion.", completedBy: [] },
      { title: "Grammar Fundamentals", type: "video", content: "https://www.youtube.com/watch?v=EjNTqrRYzUo", completedBy: [] },
    ],
    enrolledStudents: ["student-002", "student-003"],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SeedPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const batch = writeBatch(db);

      // 1. School document
      const schoolRef = doc(db, "schools", schoolSlug);
      batch.set(schoolRef, {
        name: schoolSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        primaryColor: "hsl(142 76% 36%)",
        createdAt: new Date(),
      }, { merge: true });

      // 2. Instructors
      sampleInstructors.forEach((instructor) => {
        const ref = doc(db, "schools", schoolSlug, "users", instructor.id);
        batch.set(ref, { ...instructor, schoolId: schoolSlug, createdAt: new Date() }, { merge: true });
      });

      // 3. Students
      sampleStudents.forEach((student) => {
        const ref = doc(db, "schools", schoolSlug, "users", student.id);
        batch.set(ref, { ...student, schoolId: schoolSlug, createdAt: new Date() }, { merge: true });
      });

      // 4. Courses (use a separate batch to avoid size limit)
      await batch.commit();

      const courseBatch = writeBatch(db);
      const coursesRef = collection(db, "schools", schoolSlug, "courses");
      mockCourses.forEach((course) => {
        const docRef = doc(coursesRef);
        courseBatch.set(docRef, { ...course, createdAt: new Date(), updatedAt: new Date() });
      });
      await courseBatch.commit();

      toast.success("Database seeded successfully!");
      setDone(true);
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Seed Database</h1>
      <p className="text-muted-foreground mb-8">
        Initializes <strong>{schoolSlug}</strong> with sample instructors, students, and courses.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-2xl font-bold text-primary">{sampleInstructors.length}</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground">Instructors</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-2xl font-bold text-primary">{sampleStudents.length}</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground">Students</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-2xl font-bold text-primary">{mockCourses.length}</CardTitle></CardHeader>
          <CardContent className="text-xs text-muted-foreground">Courses</CardContent>
        </Card>
      </div>

      <div className="mb-6 space-y-2">
        <p className="text-sm font-semibold">Instructors to be created:</p>
        {sampleInstructors.map((i) => (
          <div key={i.id} className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
            {i.displayName} — <code className="text-xs">{i.email}</code>
          </div>
        ))}
        <p className="text-sm font-semibold mt-4">Students to be created:</p>
        {sampleStudents.map((s) => (
          <div key={s.id} className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            {s.displayName} — <code className="text-xs">{s.email}</code>
          </div>
        ))}
      </div>

      {done ? (
        <div className="flex items-center gap-2 text-green-600 font-semibold">
          <CheckCircle className="h-5 w-5" /> Seed complete! Navigate to the dashboard.
        </div>
      ) : (
        <Button size="lg" onClick={handleSeed} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Seeding...</> : "Seed Firebase"}
        </Button>
      )}
    </div>
  );
}
