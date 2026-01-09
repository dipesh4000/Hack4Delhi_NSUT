"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface AQITrendChartProps {
  data: { time: string; aqi: number }[];
}

export default function AQITrendChart({ data }: AQITrendChartProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
      <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide mb-4">
        AQI Trend (Last 24 Hours)
      </h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#64748b" }} 
              dy={10}
            />
            <YAxis 
              hide={true} 
              domain={['dataMin - 50', 'dataMax + 50']}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#1e293b', fontWeight: 600 }}
            />
            <Line 
              type="monotone" 
              dataKey="aqi" 
              stroke="#2563eb" 
              strokeWidth={3} 
              dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center">
        AQI has increased by 12% since morning.
      </p>
    </div>
  );
}
