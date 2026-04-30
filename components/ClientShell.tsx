"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import GlobalLoader from "@/components/GlobalLoader";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const isAuthPage = pathname?.startsWith("/auth");

  // Initial load splash
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setIsVisible(true), 100);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Page transition fade
  useEffect(() => {
    if (!loading) {
      setIsVisible(false);
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [pathname, loading]);

  // Service worker registration
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered:", registration.scope);
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  return (
    <>
      {loading && <GlobalLoader />}

      <div
        className={`flex min-h-screen w-full flex-col transition-all duration-500 ease-out ${
          !loading && isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        } ${loading ? "invisible" : "visible"}`}
      >
        {!isAuthPage && <Header />}

        <main className={`flex-grow w-full ${!isAuthPage ? "pt-4 sm:pt-6" : ""}`}>
          {children}
        </main>

        {!isAuthPage && <Footer />}
      </div>

      <PwaInstallPrompt />

      {isAuthPage && (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-[#7C6EE6]/5 blur-3xl animate-float-slow" />
          <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-[#FFB7C5]/5 blur-3xl animate-float-slower" />
        </div>
      )}
    </>
  );
}
