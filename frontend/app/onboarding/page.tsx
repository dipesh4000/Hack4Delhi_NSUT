"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, ShieldCheck, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

// We can't easily do server-side redirect in a client component file without making it a server component.
// But we can check on mount. 
// Actually, let's keep it simple. The middleware now allows access.
// If they are already onboarded, the API will update them again (which is fine) or we can check user.publicMetadata on client.

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  // Optional: Redirect if already has role
  if (isLoaded && user?.publicMetadata?.role) {
     const role = user.publicMetadata.role;
     if (role === "citizen") router.push("/citizen");
     else if (role === "authority") router.push("/authority");
  }
  const [showAuthorityInput, setShowAuthorityInput] = useState(false);
  const [authorityId, setAuthorityId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSelectRole = async (role: "citizen" | "authority") => {
    if (role === "authority" && !showAuthorityInput) {
      setShowAuthorityInput(true);
      return;
    }

    if (role === "authority") {
      if (authorityId !== "dipti2007") {
        setError("Invalid Authority ID");
        return;
      }
    }

    try {
      console.log("Starting role update for:", role);
      setIsLoading(true);
      setError("");
      
      const response = await fetch("/api/user/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role, authorityId: role === "authority" ? authorityId : undefined }),
      });

      console.log("API Response status:", response.status);

      if (!response.ok) {
        const msg = await response.text();
        console.error("API Error:", msg);
        throw new Error(msg || "Failed to update role");
      }

      console.log("Role updated successfully. Reloading user...");

      // Force reload to update session metadata
      await user?.reload();
      console.log("User reloaded. Redirecting...");
      
      const target = role === "citizen" ? "/citizen" : "/authority";
      console.log("Redirecting to:", target);
      
      // Use window.location.href to force a full page load.
      // This ensures the middleware sees the updated session token.
      window.location.href = target;
    } catch (error) {
      console.error("Onboarding Error:", error);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Welcome to WardAir
          </h1>
          <p className="text-lg text-slate-600">
            To give you the best experience, please tell us who you are.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Citizen Card */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectRole("citizen")}
            disabled={isLoading || showAuthorityInput}
            className={`bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-500 transition-all text-left group ${showAuthorityInput ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <User className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">I am a Citizen</h2>
            <p className="text-slate-600">
              I want to monitor air quality in my ward, receive health alerts, and stay informed.
            </p>
          </motion.button>

          {/* Authority Card */}
          <div className="relative">
             <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectRole("authority")}
              disabled={isLoading}
              className={`w-full bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-indigo-500 transition-all text-left group ${showAuthorityInput ? 'border-indigo-500 ring-2 ring-indigo-200' : ''}`}
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                <ShieldCheck className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">I am an Authority</h2>
              <p className="text-slate-600 mb-4">
                I am a Ward Officer or Municipal Official responsible for managing pollution actions.
              </p>
              
              {showAuthorityInput && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Enter Authority ID
                  </label>
                  <input
                    type="password"
                    value={authorityId}
                    onChange={(e) => setAuthorityId(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="ID Required"
                    autoFocus
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRole("authority");
                    }}
                    className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Verify & Continue
                  </button>
                </motion.div>
              )}
            </motion.button>
          </div>
        </div>

        {error && (
          <div className="mt-6 text-center text-red-500 font-medium bg-red-50 py-2 rounded-lg">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mt-12 flex justify-center text-slate-500 gap-2 items-center">
            <Loader2 className="animate-spin" />
            Setting up your profile...
          </div>
        )}
      </div>
    </div>
  );
}
