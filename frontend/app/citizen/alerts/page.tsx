"use client";

import { MOCK_WARD_DATA } from "@/lib/mock-data";
import { Bell, Play, Film } from "lucide-react";
import VideoAlertCard from "@/components/citizen/VideoAlertCard";
import CitizenLayout from "@/components/citizen/CitizenLayout";

export default function AlertsPage() {
  const alerts = MOCK_WARD_DATA.alerts;
  const videoAlerts = alerts.filter((a) => a.videoUrl);
  const textAlerts = alerts.filter((a) => !a.videoUrl);

  return (
    <CitizenLayout>
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/20">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pollution Alerts</h1>
          <p className="text-slate-500 font-medium mt-2 max-w-md mx-auto">
            Stay updated with critical air quality warnings for your ward. Watch video alerts for important updates.
          </p>
        </div>

        {/* Featured Video Alerts Section */}
        {videoAlerts.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-2xl">
                <Film className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Video Alerts</h2>
              <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-1 rounded-lg animate-pulse uppercase tracking-widest">
                {videoAlerts.length} NEW
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {videoAlerts.map((alert) => (
                <VideoAlertCard
                  key={alert.id}
                  id={alert.id}
                  type={alert.type}
                  title={alert.title}
                  message={alert.message}
                  timestamp={alert.timestamp}
                  targetGroups={alert.targetGroups}
                  videoUrl={alert.videoUrl}
                  thumbnailUrl={alert.thumbnailUrl}
                  duration={alert.duration}
                  wardName={MOCK_WARD_DATA.name}
                  aqi={MOCK_WARD_DATA.aqi}
                />
              ))}
            </div>
          </section>
        )}

        {/* Text Alerts Section */}
        {textAlerts.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Other Updates</h2>
            <div className="space-y-4">
              {textAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-6 rounded-[2rem] border-l-8 shadow-xl bg-white/60 backdrop-blur-md ${
                    alert.type === "Severe"
                      ? "border-l-red-500"
                      : alert.type === "Warning"
                      ? "border-l-orange-500"
                      : "border-l-blue-500"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-slate-900 tracking-tight">{alert.title}</h3>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">
                      {alert.timestamp}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium mt-2 leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {alerts.length === 0 && (
          <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-slate-200">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <p className="text-xl font-black text-slate-500 tracking-tight">No active alerts at this time.</p>
            <p className="text-slate-400 font-medium mt-1">Check back later for updates.</p>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-600/20">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
              <Play className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">📹 Video Alerts are Live!</h3>
              <p className="text-blue-100 font-medium mt-2 leading-relaxed">
                We now send you video-based alerts when air quality is dangerous in your ward. 
                These quick videos help you understand the situation and take immediate action.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
