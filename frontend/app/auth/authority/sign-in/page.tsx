"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Lock, Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    console.log("Sign in attempt", { username, password, rememberMe });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-white">
      {/* Logo */}
      <div className="absolute top-8 left-8">
        <div className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
            W
          </div>
          WardAir
        </div>
      </div>

      {/* Card Wrapper */}
      <div className="w-full max-w-md px-4">
        <div className="relative">
          {/* Soft decorative layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-sky-700 via-blue-700 to-slate-500 rounded-3xl rotate-1 shadow-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-blue-500 via-sky-500 to-white rounded-3xl -rotate-1 opacity-60"></div>

          {/* Main Card */}
          <div className="relative bg-gradient-to-br from-sky-600 to-blue-600 rounded-3xl shadow-xl p-8 border border-blue-200/60">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/30 rounded-bl-full"></div>

            <div className="relative z-10 space-y-6">
              {/* Username */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white text-slate-800 placeholder-slate-400 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white text-slate-800 placeholder-slate-400 rounded-xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Remember */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-sky-400"
                  />
                  <span className="text-grey-700">Remember me</span>
                </label>
                <button className="text-white-600 hover:text-white-700 italic">
                  Forgot Password?
                </button>
              </div>

              {/* Login */}
              <button
                onClick={handleSubmit}
                className="w-full bg-white hover:bg-sky-50 text-blue-700 font-bold py-4 rounded-xl transition-all hover:shadow-lg uppercase tracking-wider"
              >
                Login
              </button>
            </div>

            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/30 rounded-tr-full"></div>
          </div>
        </div>

        {/* Signup */}
        <div className="text-center mt-6">
          <p className="text-slate-600">
            Don’t have an account?{" "}
            <Link
              href="/auth/authority/sign-up"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
