"use client";

import { motion } from "framer-motion";
import { Database, Map, Search, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: <Database className="w-6 h-6 text-blue-600" />,
    title: "Data Collection",
    desc: "Real-time pollution data ingested from CPCB sensors and IoT devices."
  },
  {
    icon: <Map className="w-6 h-6 text-indigo-600" />,
    title: "Ward Mapping",
    desc: "Pollution levels are mapped to specific administrative wards using GeoJSON."
  },
  {
    icon: <Search className="w-6 h-6 text-purple-600" />,
    title: "Source Inference",
    desc: "AI models identify if the pollution is from traffic, construction, or waste."
  },
  {
    icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
    title: "Action & Impact",
    desc: "Authorities receive specific tasks; Citizens get health alerts."
  }
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            From Data to Action
          </h2>
          <p className="text-lg text-slate-600">
            How our system turns raw sensor numbers into cleaner air.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-200 -z-10" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center"
            >
              <div className="w-12 h-12 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
