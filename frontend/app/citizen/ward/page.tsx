import { MOCK_WARD_DATA } from "@/lib/mock-data";
import PollutantCard from "@/components/citizen/PollutantCard";
import AQITrendChart from "@/components/citizen/AQITrendChart";
import { MapPin, Info } from "lucide-react";

export default function WardDetailsPage() {
  const data = MOCK_WARD_DATA;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          {data.name}
        </h1>
        <p className="text-slate-600 mt-1">Ward ID: {data.id} • Last Updated: {data.lastUpdated}</p>
      </div>

      {/* Map Placeholder */}
      <div className="bg-slate-200 rounded-2xl h-64 md:h-80 w-full flex items-center justify-center border border-slate-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
            <span className="text-slate-400 font-medium flex flex-col items-center gap-2">
                <MapPin className="w-8 h-8 opacity-50" />
                Interactive Map Integration Coming Soon
            </span>
        </div>
        {/* Overlay for "Live" feel */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm">
            Live View
        </div>
      </div>

      {/* Detailed Pollutants */}
      <div>
        <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-slate-900">Pollutant Breakdown</h2>
            <div className="group relative">
                <Info className="w-4 h-4 text-slate-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Detailed breakdown of particulate matter and gases in the air.
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.pollutants.map((p) => (
            <PollutantCard key={p.name} pollutant={p} />
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="h-80">
        <AQITrendChart data={data.hourlyTrend} />
      </div>
    </div>
  );
}
