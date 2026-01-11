"use client";

import { motion } from "framer-motion";

const stats = [
  {
    number: "40%",
    label: "Faster Response Time",
    description: "Average reduction in time from pollution spike detection to mitigation action"
  },
  {
    number: "100%",
    label: "Ward Coverage",
    description: "Complete monitoring across all administrative wards in the city"
  },
  {
    number: "24/7",
    label: "Real-Time Monitoring",
    description: "Continuous data access for citizens and authorities"
  }
];

const benefits = [
  "Ward-level pollution tracking and alerts",
  "Automated GRAP compliance monitoring",
  "Source identification (traffic, construction, waste)",
  "Direct integration with municipal systems",
  "Health advisory generation based on local conditions",
  "Historical trend analysis and forecasting"
];

export default function ImpactSection() {
  return (
    <section id="impact" className="py-20 bg-gradient-to-br from-blue-300 via-blue-500 to-indigo-600 text-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Impact & Benefits
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Delivering measurable improvements in air quality management through technology-driven solutions.
          </p>
        </div>
        
        {/* Stats and Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <div className="h-full text-center p-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                <div className="text-4xl font-bold text-blue-600 mb-3">
                  {stat.number}
                </div>
                <h3 className="text-base font-semibold mb-2 text-slate-900">
                  {stat.label}
                </h3>
                <p className="text-slate-600 text-xs flex-grow leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}

          {/* System Capabilities Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="h-full"
          >
            <div className="h-full bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 flex flex-col hover:bg-white/15 transition-colors">
              <h3 className="text-base font-semibold mb-4 text-white text-center">System Capabilities</h3>
              <div className="space-y-2.5 flex-grow">
                {benefits.slice(0, 4).map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2"
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 flex-shrink-0" />
                    <span className="text-blue-50 text-xs leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        
        {/* Bottom Note */}
        <div className="text-center mt-12 text-blue-100 text-sm">
          Developed in collaboration with environmental monitoring agencies and municipal corporations
        </div>
      </div>
    </section>
  );
}