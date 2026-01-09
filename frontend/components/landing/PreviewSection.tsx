"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function PreviewSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Two Views, One Goal.
            </h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-1 bg-blue-600 rounded-full h-auto" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">For Citizens</h3>
                  <p className="text-slate-600">
                    Instantly know if it's safe to go for a run. See which ward is the cleanest. 
                    Get specific health advisories based on your local pollution source.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-1 bg-indigo-600 rounded-full h-auto" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">For Authorities</h3>
                  <p className="text-slate-600">
                    A command center for Ward Officers. Identify hotspots, receive GRAP-mandated tasks, 
                    and track the impact of your mitigation efforts in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Preview (Placeholder for now) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl rotate-3 opacity-10 blur-2xl" />
            <div className="relative bg-slate-900 rounded-2xl border border-slate-800 p-2 shadow-2xl">
              {/* Mockup Header */}
              <div className="h-8 bg-slate-800 rounded-t-xl flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              {/* Mockup Content Area */}
              <div className="bg-slate-950 h-[300px] rounded-b-xl flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <p className="text-sm font-medium mb-2">Dashboard Preview</p>
                  <div className="flex gap-2 justify-center">
                    <div className="w-24 h-16 bg-slate-800 rounded-lg animate-pulse" />
                    <div className="w-24 h-16 bg-slate-800 rounded-lg animate-pulse delay-75" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
