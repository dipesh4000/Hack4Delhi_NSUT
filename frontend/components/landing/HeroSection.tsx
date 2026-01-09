"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-100/50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-sky-100/40 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8">
            <ShieldCheck size={16} />
            Official Ward-Level Monitoring System
          </span>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6">
            Breathe Better,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
              Ward by Ward.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
            City-wide averages hide the truth. We provide hyper-local air quality data, 
            identifying pollution sources at the ward level to drive real municipal action.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/citizen"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              Check My Ward AQI
              <ArrowRight size={20} />
            </Link>
            <Link 
              href="/authority"
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              Authority Login
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
