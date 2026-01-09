"use client";

import { motion } from "framer-motion";
import { AlertTriangle, MapPin, Wind } from "lucide-react";

const problems = [
  {
    icon: <MapPin className="w-8 h-8 text-orange-500" />,
    title: "The 'Average' Trap",
    description: "A city AQI of 200 masks the reality that your specific ward might be at 450 due to local burning."
  },
  {
    icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
    title: "Reactive, Not Proactive",
    description: "Authorities often react only when the entire city chokes, instead of fixing local hotspots early."
  },
  {
    icon: <Wind className="w-8 h-8 text-slate-500" />,
    title: "Unknown Sources",
    description: "Is it traffic? Construction? Waste burning? Without ward-level data, we are fighting blind."
  }
];

export default function ProblemSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Why City-Level Data Isn't Enough
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Pollution is hyper-local. Your health depends on the air in your street, not the sensor 10km away.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow"
            >
              <div className="mb-6 p-4 bg-white rounded-xl inline-block shadow-sm">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
