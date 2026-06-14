import type { Metadata } from "next";

import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Billing",
  description: "Manage your App Pulse Check plan and subscription.",
  path: "/settings/billing",
});

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
