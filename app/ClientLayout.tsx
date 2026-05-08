"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { AuthProvider } from "@/lib/auth-context";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="relative font-sans antialiased text-slate-900 bg-white selection:bg-blue-200">
        <LoadingScreen />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
