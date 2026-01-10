"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthoritySidebar from "@/components/authority/AuthoritySidebar";
import { motion } from "framer-motion";

export default function AuthorityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      const userRole = localStorage.getItem("userRole");

      if (!token || userRole !== "authority") {
        router.push("/auth/authority/sign-in");
        return;
      }

      try {
        const response = await fetch("/api/auth/authority/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userRole");
          router.push("/auth/authority/sign-in");
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        router.push("/auth/authority/sign-in");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <AuthoritySidebar />
      <main className="flex-1 ml-24 lg:ml-64 p-6 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
