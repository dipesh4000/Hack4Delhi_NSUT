"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AuthoritySidebar from "@/components/authority/AuthoritySidebar";
import { motion } from "framer-motion";
import { Bell, Zap, Users, Shield } from "lucide-react";

export default function AuthorityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications] = useState(12);

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split('/').pop();
    if (!path || path === 'authority') return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

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
      <div className="flex-1 ml-24 lg:ml-64 flex flex-col min-h-screen">
        {/* Modern Header */}
        <header className="h-20 bg-white/40 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {getPageTitle()}
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Delhi Pollution Control Authority
            </p>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {/* Emergency Action */}
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 text-sm font-bold">
              <Zap size={18} />
              <span>Emergency Action</span>
            </button>

            {/* Notifications */}
            <button className="relative p-3 bg-white/50 rounded-2xl text-slate-400 hover:text-blue-600 transition-all border border-white/20">
              <Bell size={20} />
              {notifications > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 border-2 border-white rounded-full" />
              )}
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">Officer 042</p>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter">Zone 1 • Active</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                <Users size={20} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
