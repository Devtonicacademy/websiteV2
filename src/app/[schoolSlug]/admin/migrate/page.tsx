"use client";

import { use, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

const SOURCE = "lagos-high";
const TARGET = "devtonic";

export default function MigratePage({
  params,
}: {
  params: Promise<{ schoolSlug: string }>;
}) {
  const { schoolSlug } = use(params);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  const handleMigrate = async () => {
    setLoading(true);
    setLogs([]);
    try {
      // ── Step 1: Copy the school document ───────────────────────────────────
      addLog(`📋 Reading schools/${SOURCE}...`);
      const sourceSchoolRef = doc(db, "schools", SOURCE);
      const sourceSnap = await getDoc(sourceSchoolRef);

      if (!sourceSnap.exists()) {
        throw new Error(`schools/${SOURCE} does not exist!`);
      }

      const schoolData = sourceSnap.data();
      if (schoolData.name === "Lagos High") schoolData.name = "Devtonic";
      if (schoolData.schoolId === SOURCE) schoolData.schoolId = TARGET;

      const targetSchoolRef = doc(db, "schools", TARGET);
      await setDoc(targetSchoolRef, schoolData, { merge: true });
      addLog(`✅ Copied school document → schools/${TARGET}`);

      // ── Step 2: Copy users ──────────────────────────────────────────────────
      addLog(`👥 Migrating users...`);
      const usersSnap = await getDocs(
        collection(db, "schools", SOURCE, "users")
      );
      const userBatch = writeBatch(db);
      usersSnap.forEach((userDoc) => {
        const data = userDoc.data();
        if (data.schoolId === SOURCE) data.schoolId = TARGET;
        userBatch.set(
          doc(db, "schools", TARGET, "users", userDoc.id),
          data,
          { merge: true }
        );
      });
      await userBatch.commit();
      addLog(`✅ Copied ${usersSnap.size} user(s)`);

      // ── Step 3: Copy courses + their attendanceLogs ────────────────────────
      addLog(`📚 Migrating courses...`);
      const coursesSnap = await getDocs(
        collection(db, "schools", SOURCE, "courses")
      );

      for (const courseDoc of coursesSnap.docs) {
        const courseData = courseDoc.data();
        if (courseData.schoolId === SOURCE) courseData.schoolId = TARGET;
        await setDoc(
          doc(db, "schools", TARGET, "courses", courseDoc.id),
          courseData,
          { merge: true }
        );
        addLog(`  ✅ Course: ${courseData.title || courseDoc.id}`);

        // Copy attendanceLogs for each course
        const logsSnap = await getDocs(
          collection(
            db,
            "schools",
            SOURCE,
            "courses",
            courseDoc.id,
            "attendanceLogs"
          )
        );
        if (logsSnap.size > 0) {
          const logBatch = writeBatch(db);
          logsSnap.forEach((logDoc) => {
            logBatch.set(
              doc(
                db,
                "schools",
                TARGET,
                "courses",
                courseDoc.id,
                "attendanceLogs",
                logDoc.id
              ),
              logDoc.data(),
              { merge: true }
            );
          });
          await logBatch.commit();
          addLog(`    ✅ Copied ${logsSnap.size} attendance log(s)`);
        }
      }

      // ── Step 4: Delete source ───────────────────────────────────────────────
      addLog(`🗑  Deleting schools/${SOURCE}...`);

      // Delete attendanceLogs per course first
      for (const courseDoc of coursesSnap.docs) {
        const logsSnap2 = await getDocs(
          collection(
            db,
            "schools",
            SOURCE,
            "courses",
            courseDoc.id,
            "attendanceLogs"
          )
        );
        const delLogBatch = writeBatch(db);
        logsSnap2.forEach((logDoc) => delLogBatch.delete(logDoc.ref));
        if (logsSnap2.size > 0) await delLogBatch.commit();

        await deleteDoc(
          doc(db, "schools", SOURCE, "courses", courseDoc.id)
        );
      }

      // Delete users
      const delUserBatch = writeBatch(db);
      usersSnap.forEach((userDoc) => delUserBatch.delete(userDoc.ref));
      await delUserBatch.commit();

      // Delete the school doc itself
      await deleteDoc(sourceSchoolRef);
      addLog(`✅ Deleted schools/${SOURCE} and all subcollection data`);

      addLog(`🎉 Migration complete!`);
      setDone(true);
      toast.success("Migration successful! lagos-high → devtonic");
    } catch (err: any) {
      console.error(err);
      addLog(`❌ Error: ${err.message}`);
      toast.error(`Migration failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Firestore Migration</h1>
      <p className="text-muted-foreground mb-6">
        This will copy all data from <code>schools/{SOURCE}</code> into{" "}
        <code>schools/{TARGET}</code>, then delete <code>schools/{SOURCE}</code>
        .
      </p>

      {schoolSlug !== TARGET && (
        <Card className="mb-6 border-yellow-500">
          <CardContent className="pt-4 flex items-center gap-3 text-yellow-600">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p className="text-sm">
              You should run this from{" "}
              <code>/devtonic/admin/migrate</code> (not{" "}
              <code>/{schoolSlug}/admin/migrate</code>).
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6 border-destructive/40 bg-destructive/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Destructive Operation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• Reads all documents from <strong>schools/lagos-high</strong></p>
          <p>• Merges them into <strong>schools/devtonic</strong></p>
          <p>• Permanently deletes <strong>schools/lagos-high</strong></p>
          <p className="text-destructive font-medium pt-1">
            This cannot be undone. Make sure you have a backup.
          </p>
        </CardContent>
      </Card>

      {!done ? (
        <Button
          size="lg"
          variant="destructive"
          onClick={handleMigrate}
          disabled={loading}
          className="w-full mb-6"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Migrating...
            </>
          ) : (
            "Run Migration: lagos-high → devtonic"
          )}
        </Button>
      ) : (
        <div className="flex items-center gap-2 text-green-600 font-semibold mb-6">
          <CheckCircle className="h-5 w-5" /> Migration complete!
        </div>
      )}

      {logs.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-mono">Migration Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-xs space-y-1 max-h-72 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className={log.startsWith("❌") ? "text-red-500" : "text-muted-foreground"}>
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
