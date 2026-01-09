import { MOCK_WARD_DATA } from "@/lib/mock-data";
import AQICard from "@/components/citizen/AQICard";
import AQITrendChart from "@/components/citizen/AQITrendChart";
import PollutantSourceChart from "@/components/citizen/PollutantSourceChart";
import ImpactActionCard from "@/components/citizen/ImpactActionCard";
import ContextualAdviceCard from "@/components/citizen/ContextualAdviceCard";
import HealthAdvisoryCard from "@/components/citizen/HealthAdvisoryCard";
import PollutantCard from "@/components/citizen/PollutantCard";
import { AlertTriangle, ArrowRight, Wind } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import UserLocation from "@/components/citizen/UserLocation";

export default async function CitizenDashboard() {
  const user = await currentUser();
  const data = MOCK_WARD_DATA;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good Morning, {user?.firstName || "Citizen"}
          </h1>
          <p className="text-slate-600 flex items-center gap-1">
            Here is the air quality report for <UserLocation fallbackName={data.name} />
          </p>
        </div>
        <Link 
          href="/citizen/ward"
          className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline"
        >
          View Full Details <ArrowRight className="w-4 h-4" />
        </Link>
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
        </div>
        <div className="lg:col-span-1">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Wind className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Likely Pollution Source (Inferred)</h3>
                </div>
                <p className="text-slate-600 text-sm mb-4">
                  Based on pollutant patterns, <span className="font-bold text-slate-800">{data.dominantSource}</span> is the primary contributor.
                </p>
                <div className="h-48">
                    <PollutantSourceChart data={data.pollutantComposition} />
                </div>
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
