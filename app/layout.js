import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"; // Added Playfair Display
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({ // Configure Playfair Display
  variable: "--font-playfair-display", // Updated variable name to be consistent
  subsets: ["latin"],
});

export const metadata = {
  title: "Living Vine Properties & Investments Ltd", // Updated title
  description: "Premium Real Estate Investment & Development", // Updated description
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`} // Added font variable and background/text colors
      >
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
