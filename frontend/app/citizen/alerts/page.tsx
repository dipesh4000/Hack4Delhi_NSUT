
"use client";

import { useState, useEffect } from 'react';
import { MOCK_WARD_DATA } from "@/lib/mock-data";
import { Bell, Sparkles, AlertTriangle, Activity, Wind, Thermometer, Car } from "lucide-react";
import { getActiveAlerts } from "@/lib/alert-rules";
import { AlertAnalysisResponse } from "@/lib/grok";

export default function AlertsPage() {
  // Use dynamic alerts for text updates
  const dynamicAlerts = getActiveAlerts(MOCK_WARD_DATA);
  const [aiAnalysis, setAiAnalysis] = useState<AlertAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIAnalysis = async () => {
      try {
        // Extract pollutant values
        const pm25 = MOCK_WARD_DATA.pollutants.find(p => p.name === "PM2.5")?.value || 0;
        const no2 = MOCK_WARD_DATA.pollutants.find(p => p.name === "NO₂")?.value || 0;
        const so2 = MOCK_WARD_DATA.pollutants.find(p => p.name === "SO₂")?.value || 0;

        const response = await fetch('/api/ai/analyze-alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aqi: MOCK_WARD_DATA.aqi,
            pm25: pm25,
            no2: no2,
            so2: so2,
            wind: 12, // Mock wind speed
            temp: 28, // Mock temp
            traffic: 'High', // Mock traffic
            location: MOCK_WARD_DATA.name,
            timestamp: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setAiAnalysis(data);
        }
      } catch (error) {
        console.error('Failed to fetch AI analysis', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAIAnalysis();
  }, []);

  return (
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

        {/* AI Insight Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[2rem] p-1 shadow-2xl">
          <div className="bg-white/10 backdrop-blur-lg rounded-[1.8rem] p-6 sm:p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/20 rounded-xl">
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Generated Insight</h2>
                <p className="text-blue-100 text-sm">Powered by Grok • Real-time Analysis</p>
              </div>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
                <div className="h-20 bg-white/20 rounded w-full"></div>
              </div>
            ) : aiAnalysis ? (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-300" />
                      <span className="font-bold text-yellow-300 uppercase tracking-wider text-sm">
                        {aiAnalysis.severity} Severity
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold leading-tight mb-2">
                      {aiAnalysis.shortAlert}
                    </h3>
                    <p className="text-blue-100 leading-relaxed">
                      {aiAnalysis.cause}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                      <Wind size={16} />
                      <span className="text-sm font-medium">12 km/h Wind</span>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                      <Thermometer size={16} />
                      <span className="text-sm font-medium">28°C Temp</span>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                      <Car size={16} />
                      <span className="text-sm font-medium">High Traffic</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Activity size={18} /> Health Impact
                    </h4>
                    <p className="text-sm text-blue-50 leading-relaxed">
                      {aiAnalysis.healthImpact}
                    </p>
                  </div>
                  
                  <div className="bg-green-500/20 p-5 rounded-2xl border border-green-500/30">
                    <h4 className="font-bold mb-2 text-green-300 flex items-center gap-2">
                      <Sparkles size={18} /> Recommended Action
                    </h4>
                    <p className="text-sm text-green-50 leading-relaxed">
                      {aiAnalysis.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-blue-200">
                Unable to generate AI analysis at the moment.
              </div>
            )}
          </div>
        </section>

        {/* Alerts Grid Section */}
        {dynamicAlerts.length > 0 ? (
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-6 px-2">Active Ward Alerts</h2>
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
  );
}
