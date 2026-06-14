"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShellSkeleton } from "@/components/skeletons/AppShellSkeleton";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [isLoading, token, router]);

  if (isLoading) {
    return <AppShellSkeleton />;
  }

  if (!token) return null;

  return <>{children}</>;
}
