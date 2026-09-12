import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ProgressProvider } from "@/components/ProgressProvider";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://iam-career-lab.vercel.app"),
  title: "IAM Career Lab — Identity & Access Management Training",
  description:
    "Four-year hands-on IAM training platform: Help Desk → IAM Analyst → IAM Engineer → IAM Architect. 44 progressive lab phases, 27 realistic tickets, Ollama AI tutor, portfolio generation, and real Hyper-V VM infrastructure.",
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
      "Four-year hands-on IAM training platform: Help Desk → IAM Analyst → IAM Engineer → IAM Architect. 44 lab phases, 27 tickets, AI tutor, and real VM infrastructure.",
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
