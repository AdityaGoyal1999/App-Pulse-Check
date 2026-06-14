import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Check",
  description: "View and manage an individual heartbeat check.",
});

export default function CheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
