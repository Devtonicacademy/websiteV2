"use client";

import { use, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function UpgradePage({ params }: { params: Promise<{ schoolSlug: string }> }) {
  const { schoolSlug } = use(params);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("You must be logged in to upgrade.");
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, "schools", schoolSlug, "users", user.uid);
      await updateDoc(userRef, { role: "admin" });
      
      // Force a hard reload so the AuthProvider snapshot and layout fetches the new role
      window.location.href = `/${schoolSlug}/dashboard`;
      
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
      <h1 className="text-3xl font-bold mb-4">Admin Access</h1>
      <p className="text-muted-foreground mb-8">
        Click the button below to instantly upgrade your account to an Administrator. This will unlock the ability to create and manage courses for {schoolSlug}.
      </p>
      
      {!user ? (
        <p className="text-destructive font-semibold">Please log in first before upgrading.</p>
      ) : (
        <Button size="lg" onClick={handleUpgrade} disabled={loading} className="w-full">
          {loading ? "Upgrading..." : "Upgrade to Admin"}
        </Button>
      )}
    </div>
  );
}
