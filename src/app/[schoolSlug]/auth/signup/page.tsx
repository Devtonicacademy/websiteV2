"use client";

import { use, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Mail, KeyRound, Loader2, ChevronRight, UserPlus } from "lucide-react";
import Link from "next/link";

export default function SignupPage({ params }: { params: Promise<{ schoolSlug: string }> }) {
    const { schoolSlug } = use(params);
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // ─── 1. Restricted Access Check ─────────────────────────────────────
            const { collection, query, where, getDocs, deleteDoc } = await import("firebase/firestore");
            const usersRef = collection(db, "schools", schoolSlug, "users");
            const q = query(usersRef, where("email", "==", email.toLowerCase().trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast.error("This email is not registered. Please contact your administrator.");
                setLoading(false);
                return;
            }

            const existingDoc = querySnapshot.docs[0];
            const userData = existingDoc.data();

            // ─── 2. Create user in Firebase Auth ────────────────────────────────
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // ─── 3. Sync Profile and Data ───────────────────────────────────────
            await updateProfile(user, { displayName: name || userData.displayName });

            // Copy data to a doc indexed by the real UID
            await setDoc(doc(db, "schools", schoolSlug, "users", user.uid), {
                ...userData,
                displayName: name || userData.displayName,
                uid: user.uid,
                invited: false,
                updatedAt: serverTimestamp(),
            });

            if (existingDoc.id !== user.uid) {
                await deleteDoc(existingDoc.ref);
            }

            toast.success("Account created successfully!");
            router.push(`/${schoolSlug}/dashboard`);
        } catch (err: any) {
            toast.error(err.message || "Failed to create account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#FAFAFA] dark:bg-black">
            {/* Background blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-[#DBEAFE] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#F3E8FF] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                <div className="mb-8 text-center space-y-2">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4"
                    >
                        New Journey
                    </motion.div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                        Create Account
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Join <span className="text-foreground capitalize">{schoolSlug.replace("-", " ")}</span>
                    </p>
                </div>

                <Card className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border-white/20 dark:border-zinc-800 shadow-2xl rounded-[2rem] overflow-hidden">
                    <CardContent className="p-8">
                        <form onSubmit={handleSignup} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold ml-1">Full Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="name"
                                        placeholder="Elvis Eyobor"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-12 h-12 rounded-2xl bg-muted/30 border-transparent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold ml-1">Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-12 h-12 rounded-2xl bg-muted/30 border-transparent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" title="password-label" className="text-sm font-semibold ml-1">Password</Label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-12 h-12 rounded-2xl bg-muted/30 border-transparent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground ml-1">Must be at least 6 characters</p>
                            </div>

                            <Button type="submit" className="w-full h-12 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 gap-2 overflow-hidden relative group" disabled={loading}>
                                <span className="relative z-10 flex items-center gap-2">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Signup"}
                                    {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                </span>
                                <div className="absolute inset-0 bg-primary-foreground/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-sm">
                            <span className="text-muted-foreground font-medium">Already have an account? </span>
                            <Link href={`/${schoolSlug}/auth/login`} className="text-primary hover:underline font-bold transition-all">
                                Sign In
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Secure footer info */}
                <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale grayscale hover:opacity-80 transition-opacity cursor-default">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <UserPlus className="w-3 h-3" /> Invitation Only
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
