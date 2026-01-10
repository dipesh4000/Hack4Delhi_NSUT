"use client";

import { MOCK_WARD_DATA } from "@/lib/mock-data";
import { Bell, Play, Film } from "lucide-react";
import VideoAlertCard from "@/components/citizen/VideoAlertCard";

export default function AlertsPage() {
  const alerts = MOCK_WARD_DATA.alerts;
  const videoAlerts = alerts.filter((a) => a.videoUrl);
  const textAlerts = alerts.filter((a) => !a.videoUrl);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Bell className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Pollution Alerts</h1>
        <p className="text-slate-600 mt-2 max-w-md mx-auto">
          Stay updated with critical air quality warnings for your ward. Watch video alerts for important updates.
        </p>
      </div>

      {/* Featured Video Alerts Section */}
      {videoAlerts.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Film className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Video Alerts</h2>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              {videoAlerts.length} NEW
            </span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
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
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Other Updates</h2>
          <div className="space-y-4">
            {textAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-5 rounded-xl border-l-4 shadow-sm bg-white ${
                  alert.type === "Severe"
                    ? "border-l-red-500"
                    : alert.type === "Warning"
                    ? "border-l-orange-500"
                    : "border-l-blue-500"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900">{alert.title}</h3>
                  <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                    {alert.timestamp}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">{alert.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {alerts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No active alerts at this time.</p>
          <p className="text-slate-400 text-sm mt-1">Check back later for updates.</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Play className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">📹 Video Alerts are Live!</h3>
            <p className="text-slate-600 text-sm mt-1">
              We now send you video-based alerts when air quality is dangerous in your ward. 
              These quick videos help you understand the situation and take immediate action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
