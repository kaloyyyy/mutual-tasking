import "./globals.css";
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
export const metadata = {
  title: "Mutual Tasking",
  description: "Task & Project Management App",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100 min-h-screen">
        <Navbar />
        <main className="">    <AuthProvider>
      {children}
    </AuthProvider></main>
      </body>
    </html>
  );
}
