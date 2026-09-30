import type { Metadata } from "next";
import "./globals.css";
import { Navbar, Footer } from "../components/ui";

export const metadata: Metadata = {
  title: "API Sentinel",
  description: "API monitoring, testing and network X-ray",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
