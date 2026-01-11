"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, AlertCircle, Loader2, Lock, Shield, Mail, User, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { DELHI_WARDS } from "@/lib/delhi-wards";

export default function AuthoritySignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    authorityId: "",
    name: "",
    email: "",
    ward: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wardSearch, setWardSearch] = useState("");
  const [showWardDropdown, setShowWardDropdown] = useState(false);

  const allWards = [
    { id: "central", name: "Central Officer" },
    ...DELHI_WARDS
  ];

  const filteredWards = allWards.filter(ward => 
    ward.name.toLowerCase().includes(wardSearch.toLowerCase())
  );

  useEffect(() => {
    localStorage.setItem("selectedRole", "authority");
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.ward-dropdown-container')) {
        setShowWardDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "authorityId" ? value.toUpperCase() : value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.authorityId.trim()) {
      setError("Authority ID is required");
      return false;
    }
    if (formData.authorityId.length < 4) {
      setError("Authority ID must be at least 4 characters");
      return false;
    }
    if (!formData.name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email address is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.ward) {
      setError("Please select a ward");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const signupResponse = await fetch("/api/auth/authority/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorityId: formData.authorityId,
          name: formData.name,
          email: formData.email,
          wardId: formData.ward === "central" ? "central" : parseInt(formData.ward),
          password: formData.password,
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        setError(signupData.message || "Sign up failed");
        return;
      }

      if (signupData.token) {
        localStorage.setItem("authToken", signupData.token);
        localStorage.setItem("userRole", "authority");
        localStorage.setItem("myWardId", formData.ward);
      }

      router.push("/authority");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 py-12">
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
  transition={{ duration: 0.4 }}
  className="relative w-full max-w-3xl"
>
  {/* decorative layers */}
  <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-blue-200 to-slate-200 rounded-2xl rotate-1"></div>
  <div className="absolute inset-0 bg-gradient-to-tl from-blue-200 via-sky-100 to-white rounded-2xl -rotate-1 opacity-70"></div>

  {/* main card */}
  <div className="relative bg-gradient-to-br from-sky-600 to-blue-600 rounded-2xl shadow-xl p-6 border border-blue-200/60">
    <div className="absolute top-0 right-0 w-28 h-28 bg-sky-400/30 rounded-bl-full"></div>

    <h1 className="text-2xl font-bold text-white text-center mb-1">
      Authority Sign Up
    </h1>
    <p className="text-sm text-white/70 text-center mb-6">
      Create your authority account
    </p>

    {error && (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-sm text-red-700">
        <AlertCircle size={18} />
        {error}
      </div>
    )}

    {/* FORM */}
    <form onSubmit={handleSignUp} className="grid grid-cols-2 gap-4">
      {/* LEFT */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-grey-900">Authority ID</label>
          <div className="relative">
            <Shield size={18} className="absolute left-3 top-3 text-blue-400" />
            <input
              name="authorityId"
              value={formData.authorityId}
              onChange={handleChange}
              className="w-full pl-9 py-2.5 rounded-lg bg-white focus:ring-2 focus:ring-sky-300 outline-none"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-grey-900">Full Name</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-3 text-blue-400" />
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-9 py-2.5 rounded-lg bg-white focus:ring-2 focus:ring-sky-300 outline-none"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-grey-900">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3 text-blue-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-9 py-2.5 rounded-lg bg-white focus:ring-2 focus:ring-sky-300 outline-none"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="space-y-4">
        <div className="ward-dropdown-container">
          <label className="text-sm font-medium text-grey-900">Assigned Ward</label>
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-3 text-blue-400" />
            <input
              value={wardSearch}
              onChange={(e) => {
                setWardSearch(e.target.value);
                setShowWardDropdown(true);
              }}
              onFocus={() => setShowWardDropdown(true)}
              className="w-full pl-9 py-2.5 rounded-lg bg-white focus:ring-2 focus:ring-sky-300 outline-none"
              disabled={isLoading}
            />
          </div>

          {showWardDropdown && (
            <div className="absolute z-20 w-full bg-white rounded-lg shadow mt-1 max-h-48 overflow-y-auto">
              {filteredWards.map((ward) => (
                <div
                  key={ward.id}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, ward: ward.id.toString() }));
                    setWardSearch(ward.name);
                    setShowWardDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-sky-50 cursor-pointer text-sm"
                >
                  {ward.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-grey-900">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full py-2.5 rounded-lg bg-white px-3 focus:ring-2 focus:ring-sky-300 outline-none"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-grey-900">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full py-2.5 rounded-lg bg-white px-3 focus:ring-2 focus:ring-sky-300 outline-none"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* BOTTOM */}
      <div className="col-span-2 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white hover:bg-sky-50 text-blue-800 font-bold py-2.5 rounded-xl transition-all hover:shadow-lg flex justify-center items-center gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
          {!isLoading && <ArrowRight size={18} />}
        </button>

        <p className="text-m text-center text-grey-900/70 mt-3">
          Already have an account?{" "}
          <Link href="/auth/authority/sign-in" className="font-semibold text-white">
            Sign In
          </Link>
        </p>
      </div>
    </form>

    <div className="absolute bottom-0 left-0 w-20 h-20 bg-blue-400/30 rounded-tr-full"></div>
  </div>
</motion.div>


    </div>
  );
}
