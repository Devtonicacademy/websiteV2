"use client";

import { use, useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { drawCertificate } from "@/lib/generate-certificate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Award, ShieldCheck, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function VerifyCertificatePage({ params }: { params: Promise<{ certificateId: string }> }) {
  const { certificateId } = use(params);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [certData, setCertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadCert() {
      try {
        const ref = doc(db, "certificates", certificateId);
        const snap = await getDoc(ref);
        
        if (snap.exists()) {
          setCertData(snap.data());
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadCert();
  }, [certificateId]);

  useEffect(() => {
    if (certData && canvasRef.current) {
      drawCertificate(canvasRef.current, {
        studentName: certData.studentName,
        courseName: certData.courseName,
        completionDate: certData.issuedAt?.toDate().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        schoolName: certData.schoolSlug?.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Devtonic Academy",
      });
    }
  }, [certData]);

  const handleDownload = () => {
    if (!canvasRef.current || !certData) return;
    const link = document.createElement("a");
    link.download = `Certificate - ${certData.courseName}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="h-16 border-b flex items-center px-6 bg-white shrink-0">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <img src="https://firebasestorage.googleapis.com/v0/b/devtonic-lms-2.firebasestorage.app/o/Logo_no%20bg.png?alt=media&token=af4099c8-048a-4f73-88ab-7c160a23048b" alt="Devtonic Logo" className="h-8 object-contain" />
            <span className="text-gray-800">Devtonic Academy</span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <Award className="w-12 h-12 text-primary/30 mb-4" />
            <p className="text-muted-foreground">Verifying certificate...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !certData) {
    return (
      <div className="flex flex-col min-h-screen bg-muted/20">
        <header className="h-16 border-b flex items-center px-6 bg-white shrink-0">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <img src="https://firebasestorage.googleapis.com/v0/b/devtonic-lms-2.firebasestorage.app/o/Logo_no%20bg.png?alt=media&token=af4099c8-048a-4f73-88ab-7c160a23048b" alt="Devtonic Logo" className="h-8 object-contain" />
            <span className="text-gray-800">Devtonic Academy</span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-red-500/20 shadow-lg">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h1 className="text-2xl font-bold mb-2">Certificate Not Found</h1>
              <p className="text-muted-foreground mb-6">
                We couldn't find a valid certificate with this verification ID. It may have been revoked or the link might be incorrect.
              </p>
              <Link href="/">
                <Button className="w-full">Return Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <header className="h-16 border-b flex items-center px-6 bg-white shrink-0 shadow-sm">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <img src="https://firebasestorage.googleapis.com/v0/b/devtonic-lms-2.firebasestorage.app/o/Logo_no%20bg.png?alt=media&token=af4099c8-048a-4f73-88ab-7c160a23048b" alt="Devtonic Logo" className="h-8 object-contain" />
          <span className="text-gray-800">Devtonic Academy</span>
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-5xl"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 bg-green-500/10 text-green-700 dark:text-green-400 px-4 py-2 rounded-full font-medium text-sm mb-4">
              <ShieldCheck className="w-5 h-5" />
              Verified Certificate
            </div>
            <h1 className="text-3xl font-bold mb-2">Certificate of Completion</h1>
            <p className="text-muted-foreground">
              Issued to <span className="font-semibold text-foreground">{certData.studentName}</span> for passing <span className="font-semibold text-foreground">{certData.courseName}</span>
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <Card className="overflow-hidden shadow-2xl bg-white border-0 ring-1 ring-border/5 w-full">
              <CardContent className="p-0 flex justify-center bg-gray-100 overflow-auto">
                {/* 1200x850 aspect ratio container scaled down */}
                <div 
                  className="relative w-full" 
                  style={{ aspectRatio: '1200/850', maxHeight: '75vh', minWidth: '800px' }}
                >
                  <canvas 
                    ref={canvasRef} 
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              size="lg" 
              className="gap-2 px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              onClick={handleDownload}
            >
              <Download className="w-5 h-5" />
              Download Full Resolution PDF
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
