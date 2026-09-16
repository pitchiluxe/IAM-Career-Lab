import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ProgressProvider } from "@/components/ProgressProvider";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://iam-career-lab.vercel.app"),
  title: "IAM Career Lab — Identity & Access Management Training",
  description:
    "Four-year hands-on IAM training platform: Help Desk → IAM Analyst → IAM Engineer → IAM Architect. 44 progressive lab phases, 41 realistic tickets with hidden root causes, recall drills, interview preparation, a local Ollama tutor, portfolio generation, and Hyper-V VM provisioning.",
  keywords: [
    "IAM",
    "Identity and Access Management",
    "cybersecurity training",
    "Active Directory",
    "help desk",
    "IAM analyst",
    "IAM engineer",
    "IAM architect",
    "zero trust",
    "RBAC",
    "SSO",
    "MFA",
    "Hyper-V lab",
    "SC-300",
    "CISSP preparation",
    "IAM interview questions",
    "IT career",
    "hands-on training",
  ],
  authors: [{ name: "Erick OMARI" }],
  creator: "Erick OMARI",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.ico", sizes: "any" },
      { url: "/icon.png", sizes: "256x256", type: "image/png" },
    ],
    apple: [{ url: "/icon.png", sizes: "256x256" }],
  },
  openGraph: {
    title: "IAM Career Lab — Identity & Access Management Training",
    description:
      "Four-year hands-on IAM training platform: Help Desk → IAM Analyst → IAM Engineer → IAM Architect. 44 lab phases, 41 tickets, recall drills, interview prep, and a local AI tutor.",
    type: "website",
    siteName: "IAM Career Lab",
    images: [{ url: "/icon.png", width: 256, height: 256, alt: "IAM Career Lab" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IAM Career Lab — Identity & Access Management Training",
    description:
      "Four-year hands-on IAM training platform: Help Desk → IAM Analyst → IAM Engineer → IAM Architect.",
    images: ["/icon.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3478f6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProgressProvider>
          <AppShell>{children}</AppShell>
        </ProgressProvider>
      </body>
    </html>
  );
}
