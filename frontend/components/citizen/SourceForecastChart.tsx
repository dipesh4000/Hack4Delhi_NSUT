"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SourceForecastChartProps {
  data: { date: string; [key: string]: string | number }[];
}

const COLORS = {
  "Transport": "#3B82F6", // Blue
  "Dust / Construction": "#F59E0B", // Amber
  "Industry": "#6366F1", // Indigo
  "Waste / Biomass": "#EF4444", // Red
  "Others": "#94A3B8", // Slate
};

export default function SourceForecastChart({ data }: SourceForecastChartProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
      <div className="mb-6">
        <h3 className="text-slate-900 font-bold text-lg">
            Daily Mean of Local and Non-Local Fractional Contribution
        </h3>
        <p className="text-slate-500 text-sm">
            Forecast for PM2.5 sources in Delhi for the next 4 days.
        </p>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barSize={40}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
                dataKey="date" 
                tick={{ fill: "#64748b", fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                dy={10}
            />
            <YAxis 
                tick={{ fill: "#64748b", fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                label={{ value: '% contribution', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }}
            />
            <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ paddingTop: '20px' }}
            />
            
            {Object.keys(COLORS).map((key) => (
                <Bar 
                    key={key} 
                    dataKey={key} 
                    stackId="a" 
                    fill={COLORS[key as keyof typeof COLORS]} 
                />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100">
         <p className="text-[10px] text-slate-400 italic text-center">
            *Modeled data based on meteorological forecasts and emission inventories.
         </p>
      </div>
    </div>
  );
}
