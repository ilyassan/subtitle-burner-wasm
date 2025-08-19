import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Advanced Video Subtitle Burner",
  description: "In-browser video subtitle burning with advanced processing strategies, batch support, and intelligent optimization",
  keywords: ["video", "subtitles", "ffmpeg", "wasm", "burn", "captions", "batch", "processing"],
  authors: [{ name: "Video Subtitle Burner" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SubtitleBurner",
  },
  openGraph: {
    title: "Advanced Video Subtitle Burner",
    description: "In-browser video subtitle burning with advanced processing strategies",
    type: "website",
    url: "https://ilyassan.github.io/subtitle-burner-wasm/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Advanced Video Subtitle Burner",
    description: "In-browser video subtitle burning with advanced processing strategies",
  },
  robots: "index, follow",
  category: "video processing",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
