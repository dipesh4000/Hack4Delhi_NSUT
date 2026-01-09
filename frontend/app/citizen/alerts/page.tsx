import { MOCK_WARD_DATA } from "@/lib/mock-data";
import { AlertTriangle, Info, Bell } from "lucide-react";

export default function AlertsPage() {
  const alerts = MOCK_WARD_DATA.alerts;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-6 h-6 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Pollution Alerts</h1>
        <p className="text-slate-600 mt-2">Stay updated with critical air quality warnings for your ward.</p>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-6 rounded-2xl border-l-4 shadow-sm bg-white ${
                alert.type === "Severe" ? "border-l-red-500" : 
                alert.type === "Warning" ? "border-l-orange-500" : "border-l-blue-500"
            }`}
          >
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg shrink-0 ${
                    alert.type === "Severe" ? "bg-red-50 text-red-600" : 
                    alert.type === "Warning" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                }`}>
                    {alert.type === "Severe" ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-900 text-lg">{alert.title}</h3>
                        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                            {alert.timestamp}
                        </span>
                    </div>
                    <p className="text-slate-600 mt-1">{alert.message}</p>
                    
                    {alert.targetGroups && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Impacts:</span>
                            {alert.targetGroups.map(group => (
                                <span key={group} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
                                    {group}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                <p className="text-slate-500">No active alerts at this time.</p>
            </div>
        )}
      </div>
    </div>
  );
}
