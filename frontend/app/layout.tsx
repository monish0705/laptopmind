import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "LaptopMind — Find Your Perfect Laptop",
  description: "AI-powered laptop recommendation and price comparison. Find the best laptop for gaming, AI/ML, video editing, programming and more.",
  keywords: "laptop recommendation, price comparison, gaming laptop, best laptop 2024",
  openGraph: {
    title: "LaptopMind — Find Your Perfect Laptop",
    description: "AI-powered laptop recommendation and price comparison",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
