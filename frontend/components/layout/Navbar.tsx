"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                W
              </div>
              WardAir
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#how-it-works" className="text-slate-600 hover:text-blue-600 transition-colors">
              How it Works
            </Link>
            <Link href="#impact" className="text-slate-600 hover:text-blue-600 transition-colors">
              Impact
            </Link>
            
            {isSignedIn ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/citizen" 
                  className="text-sm font-medium text-slate-700 hover:text-blue-600"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  href="/sign-in"
                  className="text-slate-700 hover:text-blue-600 font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-700 hover:text-blue-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4"
        >
          <Link href="#how-it-works" className="block text-slate-600 hover:text-blue-600">
            How it Works
          </Link>
          <Link href="#impact" className="block text-slate-600 hover:text-blue-600">
            Impact
          </Link>
          {!isSignedIn && (
            <>
              <Link href="/sign-in" className="block text-slate-600 hover:text-blue-600">
                Sign In
              </Link>
              <Link href="/sign-up" className="block text-blue-600 font-medium">
                Get Started
              </Link>
            </>
          )}
        </motion.div>
      )}
    </nav>
  );
}
