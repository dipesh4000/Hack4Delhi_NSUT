"use client";

import LiveDashboard from "@/components/citizen/LiveDashboard";
import CitizenLayout from "@/components/citizen/CitizenLayout";
import { useUser } from "@clerk/nextjs";

export default function CitizenDashboardPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  return (
    <CitizenLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Hey, {user?.firstName || "Citizen"}! Glad to have you back 🙌
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Here's what's happening with the air in your area today.
        </p>
      </div>
      <LiveDashboard userName={user?.firstName || "Citizen"} />
    </CitizenLayout>
  );
}

