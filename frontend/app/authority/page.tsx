"use client";

import { useEffect, useState } from 'react';
import Navbar from "@/components/layout/Navbar";
import dynamic from 'next/dynamic';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, MapPin, Activity } from 'lucide-react';

// Interfaces
interface Pollutants {
  pm25: number;
  pm10: number;
  no2: number;
}

interface Ward {
  wardId: string;
  wardName: string;
  aqi: number;
  status: string;
  sourceStation: string;
  lat: number;
  lon: number;
  pollutants: Pollutants;
}

interface CityStats {
  avgAqi: number;
  criticalWards: number;
  worstWard: string;
}

// Dynamic import for Map to avoid SSR issues
const PollutionMap = dynamic(() => import('@/components/dashboard/PollutionMap'), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>
});

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export default function AuthorityDashboard() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [cityStats, setCityStats] = useState<CityStats>({ avgAqi: 0, criticalWards: 0, worstWard: '-' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPollutionData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchPollutionData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchPollutionData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/pollution/dashboard`);
      if (!res.ok) throw new Error('Failed to connect to backend server');

      const data = await res.json();

      if (data.success) {
        setWards(data.data);
        calculateStats(data.data);
        setError(null);
      } else {
        setError(data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError('Backend connection failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Ward[]) => {
    const avg = data.reduce((acc, curr) => acc + curr.aqi, 0) / data.length;
    const critical = data.filter(w => w.aqi > 300).length;
    const worst = [...data].sort((a, b) => b.aqi - a.aqi)[0];

    setCityStats({
      avgAqi: Math.round(avg),
      criticalWards: critical,
      worstWard: worst ? worst.wardName : '-'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-orange-100 text-orange-800';
      case 'Severe': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Alerts */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Authority Command Center</h1>
            <p className="text-slate-500 mt-1">Real-time pollution monitoring and rapid response system</p>
          </div>
          {cityStats.avgAqi > 200 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-pulse">
              <AlertTriangle size={20} />
              <span className="font-semibold">Severe Air Quality Alert: GRAP Stage III Active</span>
            </div>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">City Avg AQI</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{cityStats.avgAqi}</h3>
              </div>
              <div className={`p-2 rounded-lg ${cityStats.avgAqi > 200 ? 'bg-red-100' : 'bg-green-100'}`}>
                <Activity size={24} className={cityStats.avgAqi > 200 ? 'text-red-600' : 'text-green-600'} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-red-600">
              <TrendingUp size={16} className="mr-1" />
              <span>+12 from yesterday</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Critical Wards</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{cityStats.criticalWards}</h3>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <MapPin size={24} className="text-orange-600" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Require immediate action</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 col-span-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Most Polluted Ward</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{cityStats.worstWard}</h3>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <AlertTriangle size={24} className="text-slate-600" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">PM2.5 levels are 15x above safety limits</p>
          </div>
        </div>

        {/* Main Content: Map & Ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col: Ranking Table */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Ward Rankings</h3>
              <span className="text-xs font-medium px-2 py-1 bg-white border rounded text-slate-500">Live</span>
            </div>
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Loading data...</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-slate-500 font-medium">Rank</th>
                      <th className="px-4 py-2 text-left text-slate-500 font-medium">Ward</th>
                      <th className="px-4 py-2 text-right text-slate-500 font-medium">AQI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...wards].sort((a, b) => b.aqi - a.aqi).map((ward, idx) => (
                      <tr
                        key={ward.wardId}
                        onClick={() => setSelectedWard(ward)}
                        className={`border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${selectedWard?.wardId === ward.wardId ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-4 py-3 text-slate-500 font-medium">#{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{ward.wardName}</div>
                          <div className="text-xs text-slate-400 truncate w-32">{ward.sourceStation}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(ward.status)}`}>
                            {ward.aqi}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right Col: Map & Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <PollutionMap wards={wards} selectedWard={selectedWard} onSelectWard={setSelectedWard} />
            </div>

            {selectedWard ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedWard.wardName}</h3>
                    <p className="text-slate-500 text-sm">Station: {selectedWard.sourceStation}</p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Log Action
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">PM2.5</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedWard.pollutants.pm25}</p>
                    <p className="text-xs text-slate-400 mt-1">µg/m³</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">PM10</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedWard.pollutants.pm10}</p>
                    <p className="text-xs text-slate-400 mt-1">µg/m³</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">NO2</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedWard.pollutants.no2}</p>
                    <p className="text-xs text-slate-400 mt-1">µg/m³</p>
                  </div>
                </div>

                {/* Dummy Trend Chart */}
                <div className="h-64 w-full">
                  <h4 className="text-sm font-medium text-slate-900 mb-4">24 Hour Trend</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { time: '00:00', val: selectedWard.aqi - 20 },
                      { time: '04:00', val: selectedWard.aqi - 10 },
                      { time: '08:00', val: selectedWard.aqi + 30 },
                      { time: '12:00', val: selectedWard.aqi },
                      { time: '16:00', val: selectedWard.aqi - 15 },
                      { time: '20:00', val: selectedWard.aqi + 5 },
                    ]}>
                      <defs>
                        <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="val" stroke="#8884d8" fillOpacity={1} fill="url(#colorAqi)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center h-[400px] flex flex-col items-center justify-center text-slate-400">
                <MapPin size={48} className="mb-4 opacity-50" />
                <p>Select a ward from the list or map to view detailed analytics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
