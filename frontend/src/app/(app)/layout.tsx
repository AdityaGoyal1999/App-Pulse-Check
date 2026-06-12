"use client";

import { AppShell } from "@/components/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ChecksProvider } from "@/contexts/ChecksContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ChecksProvider>
        <AppShell>{children}</AppShell>
      </ChecksProvider>
    </ProtectedRoute>
  );
}
