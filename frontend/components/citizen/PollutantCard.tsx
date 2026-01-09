import { Pollutant, getSeverityColor } from "@/lib/mock-data";

export default function PollutantCard({ pollutant }: { pollutant: Pollutant }) {
  const colorClass = getSeverityColor(pollutant.status);
  
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-slate-700">{pollutant.name}</h3>
        <span className={`w-2 h-2 rounded-full ${colorClass}`} />
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-slate-900">{pollutant.value}</span>
        <span className="text-xs text-slate-500">{pollutant.unit}</span>
      </div>
      <p className="text-xs text-slate-500 line-clamp-2">{pollutant.description}</p>
    </div>
  );
}
