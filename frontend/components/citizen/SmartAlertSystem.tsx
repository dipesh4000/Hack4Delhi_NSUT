"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { WardData } from '@/lib/mock-data';
import { getActiveAlerts, ActiveAlert } from '@/lib/alert-rules';

interface SmartAlertSystemProps {
  data: WardData;
}

export default function SmartAlertSystem({ data }: SmartAlertSystemProps) {
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Update alerts whenever data changes
    const active = getActiveAlerts(data);
    setAlerts(active);
  }, [data]);

  if (alerts.length === 0) return null;

  const topAlert = alerts[0];
  const otherAlerts = alerts.slice(1);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600',
          button: 'bg-red-100 hover:bg-red-200 text-red-700'
        };
      case 'Warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          icon: 'text-amber-600',
          button: 'bg-amber-100 hover:bg-amber-200 text-amber-700'
        };
      case 'Info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-600',
          button: 'bg-blue-100 hover:bg-blue-200 text-blue-700'
        };
    }
  };

  const topStyles = getSeverityStyles(topAlert.severity);

  return (
    <div className="w-full space-y-4 mb-6">
      {/* Top Priority Alert */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border ${topStyles.border} ${topStyles.bg} p-4 shadow-sm overflow-hidden relative`}
      >
        {/* Severity Badge */}
        <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider ${topStyles.button}`}>
          {topAlert.severity} Alert
        </div>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full bg-white shadow-sm ${topStyles.icon}`}>
            <topAlert.icon size={24} />
          </div>
          
          <div className="flex-1 pt-1">
            <h3 className={`font-bold text-lg ${topStyles.text} mb-1 pr-20`}>
              {topAlert.title}
            </h3>
            <p className={`text-sm ${topStyles.text} opacity-90 mb-3`}>
              {topAlert.message}
            </p>
            
            <div className="bg-white/60 rounded-lg p-3 text-sm font-medium flex items-start gap-2">
              <ShieldAlert size={16} className={`mt-0.5 ${topStyles.icon}`} />
              <span className={topStyles.text}>
                <span className="font-bold">Action:</span> {topAlert.action}
              </span>
            </div>
          </div>
        </div>

        {/* Expand Toggle for More Alerts */}
        {otherAlerts.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className={`w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-colors ${topStyles.button}`}
          >
            {expanded ? (
              <>
                <ChevronUp size={16} />
                Hide {otherAlerts.length} Other Alerts
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                View {otherAlerts.length} More Alerts
              </>
            )}
          </button>
        )}
      </motion.div>

      {/* Secondary Alerts List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {otherAlerts.map((alert) => {
              const styles = getSeverityStyles(alert.severity);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={`rounded-lg border ${styles.border} ${styles.bg} p-3 flex items-start gap-3`}
                >
                  <div className={`p-2 rounded-lg bg-white/80 ${styles.icon}`}>
                    <alert.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-semibold text-sm ${styles.text}`}>
                        {alert.title}
                      </h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${styles.button}`}>
                        {alert.category}
                      </span>
                    </div>
                    <p className={`text-xs ${styles.text} opacity-80 mt-1`}>
                      {alert.message}
                    </p>
                    <p className={`text-xs font-medium ${styles.text} mt-2 flex items-center gap-1`}>
                      <span className="w-1 h-1 rounded-full bg-current" />
                      {alert.action}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
