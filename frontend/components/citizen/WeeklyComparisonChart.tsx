"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface WeeklyComparisonChartProps {
  data: { day: string; aqi: number }[];
}

export default function WeeklyComparisonChart({ data }: WeeklyComparisonChartProps) {
  const getBarColor = (aqi: number) => {
    if (aqi <= 50) return "#10b981"; // Emerald 500
    if (aqi <= 100) return "#f59e0b"; // Amber 500
    if (aqi <= 200) return "#f97316"; // Orange 500
    if (aqi <= 300) return "#ef4444"; // Red 500
    if (aqi <= 400) return "#7f1d1d"; // Red 900
    return "#4c1d95"; // Violet 900
  };

  return (
    <div className="bg-white/40 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20 h-full flex flex-col">
      <h3 className="text-slate-700 font-bold text-sm uppercase tracking-wider mb-4">
        Weekly AQI Overview
      </h3>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} 
              dy={10}
            />
            <YAxis hide domain={[0, 400]} />
            <Tooltip 
              cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255, 255, 255, 0.9)' }}
              itemStyle={{ color: '#1e293b', fontWeight: 600 }}
              formatter={(value: number | undefined) => [value ?? 0, "AQI"]}
            />
            <Bar dataKey="aqi" radius={[6, 6, 0, 0]} barSize={30}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.aqi)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-slate-400 mt-2 text-center">
        Average daily AQI for the past week.
      </p>
    </div>
  );
}
