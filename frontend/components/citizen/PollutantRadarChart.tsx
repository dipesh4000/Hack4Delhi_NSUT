"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

interface PollutantRadarChartProps {
  data: {
    name: string;
    value: number;
    fullMark: number;
  }[];
}

export default function PollutantRadarChart({ data }: PollutantRadarChartProps) {
  return (
    <div className="bg-white/40 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20 h-full flex flex-col">
      <h3 className="text-slate-700 font-bold text-sm uppercase tracking-wider mb-4">
        Pollutant Fingerprint
      </h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Level"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.5}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: 'rgba(255, 255, 255, 0.9)' }}
              itemStyle={{ color: '#1e293b', fontWeight: 600 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-slate-400 mt-2 text-center italic">
        Normalized pollutant levels relative to safety limits.
      </p>
    </div>
  );
}
