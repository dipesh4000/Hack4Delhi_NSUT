"use client";

import { useState, useEffect } from "react";
import { MOCK_WARD_DATA, WardData } from "@/lib/mock-data";
import { fetchWAQIData } from "@/lib/waqi-service";
import PollutantCard from "@/components/citizen/PollutantCard";
import AQITrendChart from "@/components/citizen/AQITrendChart";
import SourceForecastChart from "@/components/citizen/SourceForecastChart";
import { MapPin, Info, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const WardMap = dynamic(() => import("@/components/citizen/WardMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">
      Loading Map...
    </div>
  ),
});

export default function WardDetailsPage() {
  const [data, setData] = useState<WardData>(MOCK_WARD_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Fetch Air Quality (WAQI)
        const realData = await fetchWAQIData(latitude, longitude);
        if (realData) {
          setData({
            ...MOCK_WARD_DATA,
            ...realData,
            // Keep existing trend if real one is empty (fallback)
            hourlyTrend: realData.hourlyTrend.length > 0 ? realData.hourlyTrend : MOCK_WARD_DATA.hourlyTrend
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error("Location denied", err);
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading ward details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-600" />
          {data.name}
        </h1>
        <p className="text-slate-600 mt-1">
            Ward ID: {data.id} • Last Updated: {data.lastUpdated}
            {data.lastUpdated === "Live from Sensor" && (
                <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">LIVE</span>
            )}
        </p>
      </div>

      {/* Map Section */}
      <div className="bg-slate-200 rounded-2xl h-64 md:h-80 w-full border border-slate-300 relative overflow-hidden group">
         <WardMap 
            lat={data.coordinates.lat} 
            lon={data.coordinates.lon} 
            name={data.name} 
         />
         {/* Overlay for "Live" feel */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm z-[400]">
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

      {/* Source Forecast Chart */}
      <div>
         <SourceForecastChart data={data.sourceForecast || []} />
      </div>

      {/* Trend Chart */}
      <div className="h-80">
        <AQITrendChart data={data.hourlyTrend} />
      </div>
    </div>
  );
}
