"use client";

import { AlertTriangle, ShieldAlert, Heart, Wind } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AlertBannerStackProps {
  aqi: number;
}

export default function AlertBannerStack({ aqi }: AlertBannerStackProps) {
  const alerts = [];

  if (aqi > 100) {
    alerts.push({
      id: "health",
      type: "warning",
      icon: Heart,
      title: "Sensitive Group Advisory",
      message: "Children and elderly should limit prolonged outdoor exertion.",
      color: "amber"
    });
  }

  if (aqi > 200) {
    alerts.push({
      id: "activity",
      type: "danger",
      icon: Wind,
      title: "Outdoor Activity Warning",
      message: "Avoid strenuous outdoor activities. Keep windows closed.",
      color: "red"
    });
  }

  if (aqi > 300) {
    alerts.push({
      id: "emergency",
      type: "critical",
      icon: ShieldAlert,
      title: "Hazardous Air Emergency",
      message: "Emergency conditions. Stay indoors and use air purifiers if possible.",
      color: "red-900"
    });
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
            className={`p-5 rounded-[2rem] border flex items-start gap-4 shadow-lg backdrop-blur-md ${
              alert.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-900' :
              alert.color === 'red' ? 'bg-red-500/10 border-red-500/20 text-red-900' :
              'bg-red-900/10 border-red-900/20 text-red-950'
            }`}
          >
            <div className={`p-3 rounded-2xl shadow-lg ${
              alert.color === 'amber' ? 'bg-amber-500 shadow-amber-500/30' :
              alert.color === 'red' ? 'bg-red-500 shadow-red-500/30' :
              'bg-red-900 shadow-red-900/30'
            }`}>
              <alert.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight">{alert.title}</h3>
              <p className="text-sm font-medium opacity-80 mt-1">{alert.message}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
