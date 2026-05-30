import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthWrapper from "@/components/AuthWrapper";

export const metadata: Metadata = {
  title: "SLOP SCAN | AI Content Detection Engine",
  description: "Detect low-quality AI-generated content across 8 domains. No external AI APIs — just linguistics, statistics, and pattern matching.",
  openGraph: {
    title: "SLOP SCAN | AI Content Detection Engine",
    description: "Detect low-quality AI-generated content across 8 domains using pure linguistics and statistics.",
    url: "https://slopscan.dev",
    siteName: "SLOP SCAN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SLOP SCAN",
    description: "Detect low-quality AI-generated content across 8 domains.",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthWrapper>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthWrapper>
      </body>
    </html>
  );
}
