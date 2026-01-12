"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-gradient-to-b from-blue-800/95 via-blue-700/90 to-blue-600/90 border-b border-blue-500/40 shadow-lg shadow-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold"
          >
            <Image 
              src="/logo.png" 
              alt="WardAir Logo" 
              width={40} 
              height={40} 
              className="rounded-lg h-auto"
            />

            <span className="text-xl tracking-tight text-white font-bold">WardAir</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#how-it-works"
              className="text-blue-100 hover:text-white transition-colors font-medium"
            >
              How it Works
            </Link>
            <Link
              href="#impact"
              className="text-blue-100 hover:text-white transition-colors font-medium"
            >
              Impact
            </Link>

            <div className="flex items-center gap-3 pl-4 border-l border-blue-500/30">
              <Link
                href="/role-select?mode=signin"
                className="text-blue-100 hover:text-white font-medium transition-colors"
              >
                Sign In
              </Link>

              <Link
                href="/role-select"
                className="px-4 py-2 rounded-lg font-semibold text-blue-800
                           bg-gradient-to-r from-white to-blue-100
                           hover:from-blue-100 hover:to-white
                           shadow-md shadow-blue-900/30 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-blue-100 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-gradient-to-b from-blue-700 to-blue-600
                       border-t border-blue-500/40 shadow-lg"
          >
            <div className="px-6 py-6 space-y-5">
              <Link
                href="#how-it-works"
                className="block text-blue-100 hover:text-white font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                How it Works
              </Link>

              <Link
                href="#impact"
                className="block text-blue-100 hover:text-white font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Impact
              </Link>

              <div className="pt-4 border-t border-blue-500/30 space-y-3">
                <Link
                  href="/role-select?mode=signin"
                  className="block text-blue-100 hover:text-white font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>

                <Link
                  href="/role-select"
                  className="block text-center px-4 py-3 rounded-lg font-semibold text-blue-800
                             bg-gradient-to-r from-white to-blue-100
                             hover:from-blue-100 hover:to-white
                             shadow-md shadow-blue-900/30 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}