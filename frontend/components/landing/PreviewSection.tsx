"use client";

import { motion } from "framer-motion";
import { User, Shield, TrendingDown, Bell, Map, BarChart3 } from "lucide-react";
import BlueBackground from "@/components/landing/BlueBackground";

export default function PreviewSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden flex items-center">
      {/* Use shared blue background */}
      <BlueBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12">
        
        {/* Header - Slightly reduced margins */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-3"
          >
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
              Dual Interface
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            Two Views, One Goal.
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-700 text-base max-w-2xl mx-auto"
          >
            Tailored experiences for citizens and authorities working together for cleaner air.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          
          {/* Text Content - Reduced spacing */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Citizens Card - Reduced padding slightly */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group"
            >
              <div className="flex gap-4 p-5 bg-white/95 backdrop-blur-sm rounded-xl border border-blue-200/50 hover:border-blue-400 hover:shadow-xl transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">For Citizens</h3>
                  <p className="text-slate-700 text-sm leading-relaxed mb-2">
                    Know if it's safe to go for a run. See which ward is cleanest. Get health advisories based on your local pollution source.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-blue-100/80 text-blue-800 text-xs rounded-md font-medium">Health Alerts</span>
                    <span className="px-2 py-0.5 bg-blue-100/80 text-blue-800 text-xs rounded-md font-medium">Real-time AQI</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Authorities Card - Reduced padding slightly */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group"
            >
              <div className="flex gap-4 p-5 bg-white/95 backdrop-blur-sm rounded-xl border border-indigo-200/50 hover:border-indigo-400 hover:shadow-xl transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <Shield className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">For Authorities</h3>
                  <p className="text-slate-700 text-sm leading-relaxed mb-2">
                    Command center for Ward Officers. Identify hotspots, receive GRAP tasks, track mitigation efforts in real-time.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-indigo-100/80 text-indigo-800 text-xs rounded-md font-medium">Task Management</span>
                    <span className="px-2 py-0.5 bg-indigo-100/80 text-indigo-800 text-xs rounded-md font-medium">Analytics</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview - Slightly scaled down */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Main Dashboard Container */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-700/50">
              
              {/* Header Bar - Slightly smaller */}
              <div className="bg-slate-950/50 backdrop-blur-sm px-4 py-2 flex items-center justify-between border-b border-slate-700/50">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center">
                  <div className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded">
                    <span className="text-slate-400 text-xs font-mono">wardair.gov.in</span>
                  </div>
                </div>
              </div>

              {/* Dashboard Screenshot */}
              <div className="relative bg-slate-900 p-1.5 overflow-hidden">
                {/* Subtle grid overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }} />
                
                {/* Image container */}
                <div className="relative rounded-lg overflow-hidden shadow-lg shadow-black/50 border border-slate-700/30">
                  <img 
                    src="/dashboard-preview.jpeg" 
                    alt="WardAir Dashboard Interface"
                    className="w-full h-auto object-cover"
                  />
                  
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Floating Elements - Smaller */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full shadow text-xs font-bold flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              Live
            </div>
            
            {/* Bottom info badge - Smaller */}
            <div className="absolute -bottom-2 -left-2 bg-white/95 backdrop-blur-sm border border-blue-200/50 px-3 py-1 rounded-full shadow text-xs font-semibold text-slate-700 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Real-time
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}