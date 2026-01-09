"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface PollutionContributionChartProps {
  data: { source: string; percentage: number; color: string }[];
}

export default function PollutionContributionChart({ data }: PollutionContributionChartProps) {
  // Transform data for stacked bar (single bar broken down) or simple bar chart
  // For clarity, a horizontal bar chart often works best for "Contribution"
  
  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide mb-1">
        Estimated Pollution Source Contribution
      </h3>
      <p className="text-xs text-slate-400 mb-4 italic">
        Based on modeled approximation, not direct measurement.
      </p>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis 
                type="category" 
                dataKey="source" 
                width={100} 
                tick={{ fontSize: 11, fill: "#475569", fontWeight: 500 }}
                interval={0}
            />
            <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value}%`, "Contribution"]}
            />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
