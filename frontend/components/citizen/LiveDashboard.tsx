"use client";

import { useState, useEffect } from "react";
import { fetchWAQIData } from "@/lib/waqi-service";
import { MOCK_WARD_DATA, WardData } from "@/lib/mock-data";
import AQICard from "@/components/citizen/AQICard";
import AQITrendChart from "@/components/citizen/AQITrendChart";
import PollutantSourceChart from "@/components/citizen/PollutantSourceChart";
import ImpactActionCard from "@/components/citizen/ImpactActionCard";
import ContextualAdviceCard from "@/components/citizen/ContextualAdviceCard";
import HealthAdvisoryCard from "@/components/citizen/HealthAdvisoryCard";
import PollutantCard from "@/components/citizen/PollutantCard";
import { AlertTriangle, Wind, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import PollutionContributionChart from "@/components/citizen/PollutionContributionChart";

export default function LiveDashboard({ userName }: { userName: string }) {
  const [data, setData] = useState<WardData>(MOCK_WARD_DATA);
  const [loading, setLoading] = useState(true);
  const [usingRealData, setUsingRealData] = useState(false);
  const [locationName, setLocationName] = useState(MOCK_WARD_DATA.name);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        let name: string | undefined;
        
        // 1. Fetch Location Name (OSM)
        try {
           const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
          );
          const osmData = await osmRes.json();
          const address = osmData.address;
          name = address.suburb || address.neighbourhood || address.residential || address.city_district || address.city;
          if (name) setLocationName(name);
        } catch (e) {
          console.error("OSM failed", e);
        }

        // 2. Fetch Air Quality (WAQI)
        // Pass the found name to try and find a matching station
        const realData = await fetchWAQIData(latitude, longitude, name);
        if (realData) {
          // Merge with mock data for missing fields (alerts, trends)
          setData({
            ...MOCK_WARD_DATA,
            ...realData,
            name: locationName, // Keep the OSM name if available
            // Use real trend if available (it has forecast now), else fallback
            hourlyTrend: realData.hourlyTrend.length > 0 ? realData.hourlyTrend : MOCK_WARD_DATA.hourlyTrend
          });
          setUsingRealData(true);
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
        <p className="text-slate-500 font-medium">Fetching live air quality for your location...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good Morning, {userName}
          </h1>
          <p className="text-slate-600 flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="flex items-center gap-1">
              Here is the air quality report for <span className="font-semibold text-slate-900 flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-500"/> {locationName}</span>
            </span>
            {usingRealData && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                (Sensor: {data.name})
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">LIVE</span>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Section 1: Status (AQI + Trend) */}
      <div className="grid md:grid-cols-2 gap-6 h-auto md:h-80">
        <AQICard aqi={data.aqi} lastUpdated={data.lastUpdated} />
        <AQITrendChart data={data.hourlyTrend} />
      </div>

      {/* Section 2: Alerts (Conditional) */}
      {data.aqi > 300 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-700 text-sm">Severe Air Quality Alert</h3>
            <p className="text-red-600 text-sm mt-1">
              Air quality is hazardous. Please avoid all outdoor activities.
            </p>
            <Link href="/citizen/alerts" className="text-red-800 text-xs font-semibold mt-2 block hover:underline">
              View all alerts
            </Link>
          </div>
        </div>
      )}


      {/* Section 3: Impact (Context + Health) */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <ContextualAdviceCard advice={data.contextualAdvice} />
            <HealthAdvisoryCard aqi={data.aqi} />
            
            {/* Feature 2: Modeled Contribution (Expandable/Secondary) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <PollutionContributionChart data={data.sourceContribution || []} />
            </div>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
             {/* Feature 1: Likely Source (Inferred) */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Wind className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Likely Pollution Source (Inferred)</h3>
                </div>
                <p className="text-slate-600 text-sm mb-4">
                  Based on pollutant patterns, <span className="font-bold text-slate-800">{data.dominantSource}</span> is the primary contributor.
                </p>
                {data.sourceReasoning && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 italic">
                            "{data.sourceReasoning}"
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Confidence:</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                data.sourceConfidence === 'High' ? 'bg-green-100 text-green-700' :
                                data.sourceConfidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                {data.sourceConfidence || "Low"}
                            </span>
                        </div>
                    </div>
                )}
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 leading-tight">
                        *Sources are inferred using pollutant patterns and time-based analysis. Exact source apportionment requires specialized sensors.
                    </p>
                </div>
            </div>

            {/* Pollutant Composition Pie Chart (Existing) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-64">
                 <PollutantSourceChart data={data.pollutantComposition} />
            </div>
        </div>
      </div>

      {/* Section 4: Action (How to Help) */}
      <ImpactActionCard dos={data.dailyActions.dos} avoids={data.dailyActions.avoids} />

      {/* Section 5: Data (Key Pollutants) */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Key Pollutants</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.pollutants.map((p) => (
            <PollutantCard key={p.name} pollutant={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
