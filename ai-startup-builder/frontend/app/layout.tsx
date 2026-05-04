import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/context/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StartupFlow | Professional AI Startup Builder",
  description: "Enterprise-grade AI agents for technical validation and market intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <AuthProvider>
          <div className="fixed inset-0 noise-bg -z-10" />
          <Header />
          <main className="pt-32 pb-24 min-h-[calc(100vh-64px)] flex flex-col items-center w-full">
             {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
