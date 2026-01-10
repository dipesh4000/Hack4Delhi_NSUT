"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RoleSelectPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"citizen" | "authority" | null>(null);

  const handleRoleSelect = (role: "citizen" | "authority") => {
    setSelectedRole(role);
    // Store role selection in localStorage for post-auth flow
    localStorage.setItem("selectedRole", role);
    
    // Check if we're in sign-in or sign-up mode
    const isSignIn = new URLSearchParams(window.location.search).get("mode") === "signin";
    
    if (role === "citizen") {
      if (isSignIn) {
        router.push("/sign-in");
      } else {
        router.push("/sign-up");
      }
    } else {
      // Authority routes
      if (isSignIn) {
        router.push("/auth/authority/sign-in");
      } else {
        router.push("/auth/authority/sign-up");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            W
          </div>
          WardAir
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full mx-auto px-4"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Join WardAir
          </h1>
          <p className="text-xl text-slate-600">
            Are you a citizen concerned about air quality or an authority managing it?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Citizen Option */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRoleSelect("citizen")}
            disabled={selectedRole !== null}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-sky-500 rounded-2xl blur-lg group-hover:blur-xl transition opacity-75 group-hover:opacity-100 disabled:opacity-50" />
            <div className="relative bg-white rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
                <User size={32} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Citizen</h3>
              <p className="text-slate-600 mb-4">
                Check air quality in your ward and stay informed about pollution levels
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold">
                {selectedRole === "citizen" && <Loader2 size={20} className="animate-spin" />}
                {selectedRole === "citizen" ? "Redirecting..." : "Continue"}
                {selectedRole !== "citizen" && <ArrowRight size={20} />}
              </div>
            </div>
          </motion.button>

          {/* Authority Option */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRoleSelect("authority")}
            disabled={selectedRole !== null}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-400 to-slate-500 rounded-2xl blur-lg group-hover:blur-xl transition opacity-75 group-hover:opacity-100 disabled:opacity-50" />
            <div className="relative bg-white rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center hover:shadow-2xl transition">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-slate-200 transition">
                <ShieldCheck size={32} className="text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Authority</h3>
              <p className="text-slate-600 mb-4">
                Manage ward pollution data and respond to air quality alerts
              </p>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                {selectedRole === "authority" && <Loader2 size={20} className="animate-spin" />}
                {selectedRole === "authority" ? "Redirecting..." : "Continue"}
                {selectedRole !== "authority" && <ArrowRight size={20} />}
              </div>
            </div>
          </motion.button>
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-600">
            Already have an account?{" "}
            <Link href="/role-select?mode=signin" className="text-blue-600 font-semibold hover:text-blue-700">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
