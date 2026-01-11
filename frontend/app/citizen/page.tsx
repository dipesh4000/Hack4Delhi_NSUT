"use client";

import HybridLiveDashboard from "@/components/citizen/HybridLiveDashboard";
import { useUser } from "@clerk/nextjs";

export default function CitizenDashboard() {
  const { user } = useUser();
  const userName = user?.firstName || "Citizen";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Hey, {userName}! Glad to have you back 👋
        </h1>
        <p className="text-slate-500 font-medium mt-2">Here's what's happening with the air in your area today.</p>
      </div>

      <HybridLiveDashboard userName={userName} />
    </div>
  );
}
