import type { Metadata } from "next";
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { Geist, Geist_Mono } from "next/font/google";
import "./tailwind-built.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VetCRM",
  description: "Veterinary CRM System",
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
    >
      <body className="min-h-full flex relative">
        {/* Decorative ambient background */}
        <div className="fixed inset-0 z-[-1]" style={{ background: 'linear-gradient(135deg, #ddd6fe 0%, #bae6fd 50%, #a7f3d0 100%)' }}></div>
        <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-pulse pointer-events-none z-[-1]" style={{ background: '#8b5cf6' }}></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-pulse pointer-events-none z-[-1]" style={{ background: '#0ea5e9' }}></div>
        <Sidebar />
        <div className="flex-1 min-h-screen relative z-10">
           {children}
        </div>
      </body>
    </html>
  );
}
