import { HEALTH_ADVISORY, getSeverity } from "@/lib/mock-data";
import { CheckCircle2, XCircle } from "lucide-react";

export default function HealthAdvisoryCard({ aqi }: { aqi: number }) {
  const severity = getSeverity(aqi);
  const advisory = HEALTH_ADVISORY[severity.toLowerCase() as keyof typeof HEALTH_ADVISORY];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Health Advisory</h2>
      
      <div className="mb-6">
        <h3 className="font-semibold text-slate-800 mb-1">{advisory.title}</h3>
        <p className="text-slate-600 text-sm">{advisory.message}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Recommended
          </h4>
          <ul className="space-y-2">
            {advisory.dos.map((item, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="w-1 h-1 bg-emerald-400 rounded-full mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Avoid
          </h4>
          <ul className="space-y-2">
            {advisory.donts.map((item, i) => (
              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="w-1 h-1 bg-red-400 rounded-full mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
