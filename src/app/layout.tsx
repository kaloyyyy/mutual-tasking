import "./globals.css";
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Mutual Tasking",
  description: "Task & Project Management App",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100 min-h-screen">
        <Navbar />
        {/* Responsive padding: small on mobile, larger on desktop */}
        <main className="px-4 py-6 sm:px-6 lg:px-20 lg:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
