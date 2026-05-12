import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const ORG_NAME = process.env.NEXT_PUBLIC_ORG_NAME ?? "ORP";
const ORG_TAGLINE = process.env.NEXT_PUBLIC_ORG_TAGLINE ?? "Organization Resource Planning";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: `${ORG_NAME} — ${ORG_TAGLINE}`,
  description: `${ORG_NAME} — ${ORG_TAGLINE}. Internal management platform for your organization.`,
  keywords: [ORG_NAME, "Organization", "Resource Planning", "ORP"],
  icons: {
    icon: [
      { url: "/logo.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: { url: "/logo.png", type: "image/png" },
    shortcut: "/logo.ico",
  },
  openGraph: {
    title: `${ORG_NAME} — ${ORG_TAGLINE}`,
    description: `${ORG_NAME} internal management platform.`,
    type: "website",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${ORG_NAME} — ${ORG_TAGLINE}`,
    description: `${ORG_NAME} internal management platform.`,
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={` `} style={{ height: "100%" }}
    >
      <body style={{ minHeight: "100%", background: "#000", color: "#fff", overflowX: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
