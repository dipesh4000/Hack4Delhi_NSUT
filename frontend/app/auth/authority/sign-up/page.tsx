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
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Authority Account</h1>
            <p className="text-slate-600">Join the WardAir Authority Portal</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Authority ID
              </label>
              <div className="relative">
                <Shield size={20} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  name="authorityId"
                  value={formData.authorityId}
                  onChange={handleChange}
                  placeholder="e.g., AUTH001"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Assigned Ward
              </label>
              <div className="relative">
                <MapPin size={20} className="absolute left-3 top-3 text-slate-400 pointer-events-none z-10" />
                <div className="relative ward-dropdown-container">
                  <input
                    type="text"
                    value={wardSearch}
                    onChange={(e) => {
                      setWardSearch(e.target.value);
                      setShowWardDropdown(true);
                    }}
                    onFocus={() => setShowWardDropdown(true)}
                    placeholder="Search for ward or select Central Officer"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <Search size={16} className="absolute right-3 top-3.5 text-slate-400" />
                  {showWardDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredWards.map((ward) => (
                        <div
                          key={ward.id}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, ward: ward.id.toString() }));
                            setWardSearch(ward.name);
                            setShowWardDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                        >
                          <span className={ward.id === "central" ? "font-semibold text-blue-600" : ""}>
                            {ward.name}
                          </span>
                        </div>
                      ))}
                      {filteredWards.length === 0 && (
                        <div className="px-4 py-2 text-slate-500 text-sm">
                          No wards found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Sign Up
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{" "}
              <Link href="/auth/authority/sign-in" className="text-blue-600 font-semibold hover:text-blue-700">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-sm mt-6">
          For support, contact your administrator
        </p>
      </motion.div>
    </div>
  );
}
