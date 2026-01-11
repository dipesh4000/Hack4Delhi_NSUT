"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<"citizen" | "authority" | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("selectedRole");
    setSelectedRole(role as "citizen" | "authority" | null);
  }, []);

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

      <div className="w-full max-w-md">
        {selectedRole && (
          <div className="text-center mb-4">
            <p className="text-slate-600 text-sm">
              Signing up as: <span className="font-semibold capitalize text-slate-900">{selectedRole}</span>
            </p>
          </div>
        )}
        <SignUp 
          appearance={{
            elements: {
              card: "shadow-xl rounded-2xl",
            },
          }}
          signInUrl="/sign-in"
          redirectUrl="/citizen"
        />
      </div>
    </div>
  );
}
