import type { Metadata } from "next";

const SITE_NAME = "App Pulse Check";

export function createPageMetadata({
  title,
  description,
  path = "",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const pageTitle =
    title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: "/og-image.svg",
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
      ...(path ? { url: path } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
    },
  };
}
