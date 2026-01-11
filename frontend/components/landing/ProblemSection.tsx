"use client";

import { motion } from "framer-motion";
import { AlertTriangle, MapPin, Wind } from "lucide-react";
import BlueBackground from "@/components/landing/BlueBackground";

const problems = [
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "The 'Average' Trap",
    description:
      "A city AQI of 200 can hide the reality that a specific ward may face far higher exposure due to local factors.",
    gradient: "from-blue-600 to-sky-500",
    bgGradient: "from-white/95 to-white/80 backdrop-blur-sm",
    iconBg: "bg-blue-100",
    accentColor: "border-blue-200/50",
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "Reactive Monitoring",
    description:
      "City-wide alerts often arrive after damage is done, instead of enabling early ward-level intervention.",
    gradient: "from-sky-600 to-blue-700",
    bgGradient: "from-white/95 to-white/80 backdrop-blur-sm",
    iconBg: "bg-sky-100",
    accentColor: "border-sky-200/50",
  },
  {
    icon: <Wind className="w-6 h-6" />,
    title: "Unidentified Sources",
    description:
      "Without localized data, identifying pollution sources such as traffic or construction becomes guesswork.",
    gradient: "from-slate-600 to-slate-800",
    bgGradient: "from-white/95 to-white/80 backdrop-blur-sm",
    iconBg: "bg-slate-100",
    accentColor: "border-slate-200/50",
  },
];

export default function ProblemSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden flex items-center">
      {/* Use shared blue background */}
      <BlueBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1.5 bg-blue-50/80 backdrop-blur-sm text-blue-700 text-sm font-medium rounded-full mb-3 border border-blue-200/50"
          >
            The Challenge
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            Why City-Level Data Falls Short
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base text-slate-700 max-w-2xl mx-auto"
          >
            Air quality varies block by block. Effective action requires visibility at the ward level.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="group relative h-full"
            >
              <div
                className={`h-full p-6 rounded-xl bg-gradient-to-br ${item.bgGradient} border ${item.accentColor} shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                {/* Icon */}
                <div className="mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.gradient} p-[1px]`}
                  >
                    <div
                      className={`w-full h-full rounded-lg ${item.iconBg} flex items-center justify-center text-slate-700`}
                    >
                      {item.icon}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {item.description}
                </p>

                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <p className="text-slate-700 text-sm font-medium">
              Ward-level insights enable earlier, targeted action
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}