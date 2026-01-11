"use client";

import { MOCK_WARD_DATA } from "@/lib/mock-data";
import { Bell, Play, Film } from "lucide-react";
import VideoAlertCard from "@/components/citizen/VideoAlertCard";
import CitizenLayout from "@/components/citizen/CitizenLayout";
import { getActiveAlerts } from "@/lib/alert-rules";

export default function AlertsPage() {
  // Use dynamic alerts for text updates
  const dynamicAlerts = getActiveAlerts(MOCK_WARD_DATA);

  return (
    <CitizenLayout>
      <div className="max-w-7xl mx-auto space-y-10 px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pollution Alerts</h1>
          <p className="text-slate-500 font-medium mt-2 max-w-md mx-auto">
            Stay updated with critical air quality warnings and actionable advice for your ward.
          </p>
        </div>

        {/* Alerts Grid Section */}
        {dynamicAlerts.length > 0 ? (
          <section>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dynamicAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-6 rounded-[2rem] border-t-8 shadow-xl bg-white/60 backdrop-blur-md flex flex-col h-full ${
                    alert.severity === "Critical"
                      ? "border-t-red-500"
                      : alert.severity === "Warning"
                      ? "border-t-orange-500"
                      : "border-t-blue-500"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${
                      alert.severity === "Critical" ? "bg-red-100 text-red-600" :
                      alert.severity === "Warning" ? "bg-orange-100 text-orange-600" :
                      "bg-blue-100 text-blue-600"
                    }`}>
                      <alert.icon size={24} />
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                       alert.severity === "Critical" ? "bg-red-100 text-red-700" :
                       alert.severity === "Warning" ? "bg-orange-100 text-orange-700" :
                       "bg-blue-100 text-blue-700"
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  
                  <h3 className="font-black text-lg text-slate-900 tracking-tight mb-2">{alert.title}</h3>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed flex-grow">{alert.message}</p>
                  
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        alert.severity === "Critical" ? "bg-red-50 text-red-700" :
                        alert.severity === "Warning" ? "bg-orange-50 text-orange-700" :
                        "bg-blue-50 text-blue-700"
                      }`}>
                        Action
                      </span>
                      <span className="text-sm font-bold text-slate-800">{alert.action}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-slate-200">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <p className="text-xl font-black text-slate-500 tracking-tight">No active alerts at this time.</p>
            <p className="text-slate-400 font-medium mt-1">Check back later for updates.</p>
          </div>
        )}
      </div>
    </CitizenLayout>
  );
}
