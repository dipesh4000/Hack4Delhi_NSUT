"use client";

import { motion } from "framer-motion";
import { Database, Map, Search, CheckCircle2 } from "lucide-react";
import BlueBackground from "@/components/landing/BlueBackground";

const steps = [
  {
    icon: <Database className="w-6 h-6" />,
    title: "Data Collection",
    desc: "Real-time pollution data ingested from CPCB sensors and IoT devices.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-100"
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: "Ward Mapping",
    desc: "Pollution levels are mapped to specific administrative wards using GeoJSON.",
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-100"
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "Source Inference",
    desc: "AI models identify if the pollution is from traffic, construction, or waste.",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-100"
  },
  {
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: "Action & Impact",
    desc: "Authorities receive specific tasks; Citizens get health alerts.",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-100"
  }
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative min-h-[90vh] overflow-hidden flex items-center">
      {/* Use shared blue background */}
      <BlueBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-500/20">
              Our Process
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
          >
            From Data to Action
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed"
          >
            Our intelligent system transforms raw environmental data into actionable insights for cleaner, healthier cities.
          </motion.p>
        </div>

        {/* Steps Grid - Only reduced spacing */}
        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connecting Arrow Line (Desktop) */}
          <div className="hidden md:block absolute top-14 left-0 w-full h-1 -z-10">
            <div className="w-full h-full bg-gradient-to-r from-blue-200/50 via-indigo-200/50 via-purple-200/50 to-emerald-200/50 rounded-full" />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="relative group"
            >
              {/* Card - Only reduced padding */}
              <div className="relative bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/50 shadow-xl hover:shadow-2xl hover:border-blue-300 transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {index + 1}
                </div>
                
                {/* Icon Container with Gradient - Only slightly smaller */}
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${step.color} p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                  <div className={`w-full h-full ${step.bgColor} backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-700`}>
                    {step.icon}
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-slate-700 text-center leading-relaxed text-sm">
                  {step.desc}
                </p>
                
                {/* Hover Accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
              
              {/* Arrow Between Steps (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 -right-3 z-20">
                  <div className="w-6 h-6 bg-white border-2 border-blue-200/50 rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA - Only reduced margin */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full shadow-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <p className="text-slate-700 text-sm font-medium">
              Powered by advanced AI and real-time data processing
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}