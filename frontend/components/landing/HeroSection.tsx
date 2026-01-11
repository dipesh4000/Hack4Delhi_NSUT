"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Building2 } from "lucide-react";
import BlueBackground from "@/components/landing/BlueBackground";
import AQIWidget from "@/components/landing/AQIWidget";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* BLUE BACKGROUND SYSTEM */}
      <BlueBackground />

      {/* CONTENT - Slightly reduced spacing */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-start gap-8 lg:gap-14 pt-28 pb-16 lg:pt-40 lg:pb-24">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/2 text-center lg:text-left lg:pt-12"
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                           bg-blue-100 border border-blue-200
                           text-blue-800 text-sm font-medium mb-8">
              <ShieldCheck size={16} />
              Official Ward-Level Monitoring System
            </span>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6">
              Breathe Better,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-600">
                Ward by Ward.
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg lg:text-xl text-slate-700 mb-8 lg:mb-10 leading-relaxed">
              City-wide averages hide the truth. We provide hyper-local air quality data,
              identifying pollution sources at the ward level to drive real municipal action.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center lg:justify-start gap-4">
              <Link
                href="/citizen"
                className="w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4
                         bg-blue-700 text-white rounded-xl font-semibold
                         hover:bg-blue-800 transition-all
                         flex items-center justify-center gap-2
                         shadow-lg shadow-blue-700/30 text-sm lg:text-base"
              >
                Check My Ward AQI
                <ArrowRight size={20} />
              </Link>

              <Link
                href="/authority"
                className="w-full sm:w-auto px-6 lg:px-8 py-3 lg:py-4
                         bg-white text-slate-900 rounded-xl font-semibold
                         border-2 border-blue-300 hover:bg-blue-50
                         transition-all flex items-center justify-center gap-2
                         text-sm lg:text-base"
              >
                Authority Dashboard
                <Building2 size={20} />
              </Link>
            </div>
          </motion.div>

          {/* Right Column - AQI Widget */}
          <div className="lg:w-1/2 flex items-start justify-center lg:justify-end lg:pt-24">
            <div className="w-full max-w-md transform translate-y-4">
              <AQIWidget />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}