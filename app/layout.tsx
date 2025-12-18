import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image"; // 👈 1. Added this import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shidduch Gmach Portal",
  description: "Manage your shidduch profile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 👇 2. START LOGO SECTION 👇 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          paddingTop: '30px', 
          paddingBottom: '20px' 
        }}>
          <Image 
            src="/heart-logo.png"  // Make sure this file is inside your 'public' folder!
            alt="Shidduch Gmach Logo"
            width={120}            // Adjust these numbers if the logo is too big/small
            height={120}
            priority
            style={{ objectFit: "contain" }} 
          />
        </div>
        {/* 👆 END LOGO SECTION 👆 */}

        {children}
      </body>
    </html>
  );
}