"use client";

import CitizenLayout from "@/components/citizen/CitizenLayout";
import { History, Search, Filter, Download, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const MOCK_HISTORY = [
  { id: 1, date: "2026-01-09", location: "Rohini Sector 8", avgAqi: 245, status: "Severe", source: "Biomass Burning" },
  { id: 2, date: "2026-01-08", location: "Rohini Sector 8", avgAqi: 180, status: "Unhealthy", source: "Vehicular Emissions" },
  { id: 3, date: "2026-01-07", location: "Dwarka Sector 10", avgAqi: 120, status: "Moderate", source: "Construction Dust" },
  { id: 4, date: "2026-01-06", location: "Dwarka Sector 10", avgAqi: 95, status: "Good", source: "N/A" },
];

export default function HistoryPage() {
  return (
    <CitizenLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Air Quality History</h1>
            <p className="text-slate-500 font-medium mt-1">Review past air quality records for your areas.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" /> Export Data
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-xl">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search locations..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <button className="px-6 py-3 bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter by Date
          </button>
        </div>

        {/* Table */}
        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg AQI</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Source</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_HISTORY.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-white/50 transition-all group">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-900">{item.date}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-bold text-slate-600">{item.location}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-lg font-black text-slate-900">{item.avgAqi}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                      item.status === "Severe" ? "bg-red-50 text-red-600 border-red-100" :
                      item.status === "Unhealthy" ? "bg-orange-50 text-orange-600 border-orange-100" :
                      item.status === "Moderate" ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                      "bg-emerald-50 text-emerald-600 border-emerald-100"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-slate-400">{item.source}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CitizenLayout>
  );
}

