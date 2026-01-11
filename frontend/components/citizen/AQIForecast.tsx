"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ForecastDay {
  day: string;
  avg: number;
  max: number;
  min: number;
}

interface AQIForecastProps {
  forecastPM25: ForecastDay[];
  forecastPM10: ForecastDay[];
  currentAQI: number;
}

export default function AQIForecast({ forecastPM25, forecastPM10, currentAQI }: AQIForecastProps) {
  // Convert PM2.5 concentration (µg/m³) to AQI using EPA breakpoints
  const pm25ToAQI = (concentration: number): number => {
    const breakpoints = [
      { cLow: 0, cHigh: 12, aqiLow: 0, aqiHigh: 50 },
      { cLow: 12.1, cHigh: 35.4, aqiLow: 51, aqiHigh: 100 },
      { cLow: 35.5, cHigh: 55.4, aqiLow: 101, aqiHigh: 150 },
      { cLow: 55.5, cHigh: 150.4, aqiLow: 151, aqiHigh: 200 },
      { cLow: 150.5, cHigh: 250.4, aqiLow: 201, aqiHigh: 300 },
      { cLow: 250.5, cHigh: 500, aqiLow: 301, aqiHigh: 500 }
    ];
    
    for (const bp of breakpoints) {
      if (concentration >= bp.cLow && concentration <= bp.cHigh) {
        return Math.round(
          ((bp.aqiHigh - bp.aqiLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.aqiLow
        );
      }
    }
    return concentration > 500 ? 500 : Math.round(concentration);
  };

  // Combine PM2.5 and PM10 forecasts
  const forecastData = forecastPM25.map((pm25Day, index) => {
    const pm25AQI = pm25ToAQI(pm25Day.avg);
    const pm10AQI = pm25ToAQI(forecastPM10[index]?.avg || 0);
    
    return {
      date: new Date(pm25Day.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: pm25Day.day,
      pm25: pm25Day.avg,
      pm25Max: pm25Day.max,
      pm25Min: pm25Day.min,
      pm10: forecastPM10[index]?.avg || 0,
      aqi: Math.max(pm25AQI, pm10AQI) // AQI is max of pollutants
    };
  });

  // Calculate trend
  const firstDayAQI = forecastData[0]?.aqi || currentAQI;
  const lastDayAQI = forecastData[forecastData.length - 1]?.aqi || currentAQI;
  const trendPercentage = ((lastDayAQI - firstDayAQI) / firstDayAQI * 100).toFixed(1);
  const isImproving = lastDayAQI < firstDayAQI;
  const isStable = Math.abs(lastDayAQI - firstDayAQI) < 10;

  // Find best and worst days
  const bestDay = forecastData.reduce((min, day) => day.aqi < min.aqi ? day : min, forecastData[0]);
  const worstDay = forecastData.reduce((max, day) => day.aqi > max.aqi ? day : max, forecastData[0]);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981'; // Good - Green
    if (aqi <= 100) return '#84cc16'; // Moderate - Yellow-Green
    if (aqi <= 200) return '#f59e0b'; // Poor - Orange
    if (aqi <= 300) return '#ef4444'; // Very Poor - Red
    return '#991b1b'; // Severe - Dark Red
  };

  const getAQIStatus = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 200) return 'Poor';
    if (aqi <= 300) return 'Very Poor';
    return 'Severe';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 shadow-xl border-2 border-blue-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500 rounded-2xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">7-Day AQI Forecast</h3>
            <p className="text-sm text-slate-500 font-medium">Predictive air quality analysis</p>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
          isStable ? 'bg-gray-100 text-gray-700' :
          isImproving ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isStable ? (
            <>
              <Minus size={20} />
              <span>Stable</span>
            </>
          ) : isImproving ? (
            <>
              <TrendingDown size={20} />
              <span>{trendPercentage}% Better</span>
            </>
          ) : (
            <>
              <TrendingUp size={20} />
              <span>{trendPercentage}% Worse</span>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={forecastData}>
            <defs>
              <linearGradient id="colorAQI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: 600 }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: 600 }}
              label={{ value: 'AQI', angle: -90, position: 'insideLeft', style: { fontWeight: 700 } }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: any, name?: string) => {
                const numValue = value as number;
                const labelName = name || '';
                if (labelName === 'aqi') return [numValue, 'AQI'];
                if (labelName === 'pm25') return [numValue, 'PM2.5'];
                if (labelName === 'pm10') return [numValue, 'PM10'];
                return [numValue, labelName];
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }}
            />
            <Area 
              type="monotone" 
              dataKey="aqi" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              fill="url(#colorAQI)"
              name="AQI"
            />
            <Line 
              type="monotone" 
              dataKey="pm25Max" 
              stroke="#ef4444" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="PM2.5 Max"
            />
            <Line 
              type="monotone" 
              dataKey="pm25Min" 
              stroke="#10b981" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="PM2.5 Min"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Day */}
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs font-black text-green-700 uppercase tracking-wider">Best Day</span>
          </div>
          <p className="text-2xl font-black text-green-900">{bestDay.date}</p>
          <p className="text-sm font-bold text-green-700">AQI: {bestDay.aqi} ({getAQIStatus(bestDay.aqi)})</p>
        </div>

        {/* Worst Day */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs font-black text-red-700 uppercase tracking-wider">Worst Day</span>
          </div>
          <p className="text-2xl font-black text-red-900">{worstDay.date}</p>
          <p className="text-sm font-bold text-red-700">AQI: {worstDay.aqi} ({getAQIStatus(worstDay.aqi)})</p>
        </div>

        {/* Average */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs font-black text-blue-700 uppercase tracking-wider">7-Day Average</span>
          </div>
          <p className="text-2xl font-black text-blue-900">
            {Math.round(forecastData.reduce((sum, day) => sum + day.aqi, 0) / forecastData.length)}
          </p>
          <p className="text-sm font-bold text-blue-700">
            {getAQIStatus(Math.round(forecastData.reduce((sum, day) => sum + day.aqi, 0) / forecastData.length))}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-amber-900 mb-1">Planning Recommendations</h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              {isImproving ? (
                <>Air quality is expected to improve over the next week. Plan outdoor activities for <strong>{bestDay.date}</strong> when AQI will be lowest at {bestDay.aqi}.</>
              ) : isStable ? (
                <>Air quality will remain relatively stable. Maintain usual precautions and monitor daily updates.</>
              ) : (
                <>Air quality is expected to worsen. Avoid outdoor activities on <strong>{worstDay.date}</strong> when AQI may reach {worstDay.aqi}. Stock up on N95 masks and consider using air purifiers.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="mt-6">
        <h4 className="font-bold text-slate-900 mb-3">Daily Breakdown</h4>
        <div className="space-y-2">
          {forecastData.map((day, index) => (
            <div 
              key={day.fullDate}
              className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-500">
                    {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : new Date(day.fullDate).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-sm font-black text-slate-900">{day.date}</p>
                </div>
                <div 
                  className="w-2 h-12 rounded-full"
                  style={{ backgroundColor: getAQIColor(day.aqi) }}
                ></div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900">{day.aqi}</p>
                <p className="text-xs font-bold" style={{ color: getAQIColor(day.aqi) }}>
                  {getAQIStatus(day.aqi)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
