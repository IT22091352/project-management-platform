import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { AppToaster } from "@/components/toaster";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Operations Hub",
  description: "Modern Project and Team Task Management Platform",
  applicationName: "Operations Hub",
  metadataBase: new URL("https://project-management-cyphlab.vercel.app"),
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Operations Hub",
    description: "Modern Project and Team Task Management Platform",
    url: "https://project-management-cyphlab.vercel.app",
    siteName: "Operations Hub",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: "Operations Hub Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Operations Hub",
    description: "Modern Project and Team Task Management Platform",
    images: ["/opengraph.png"],
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-slate-950 text-slate-100" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <AppToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
