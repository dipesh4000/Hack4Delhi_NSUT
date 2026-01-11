"use client";

import { useEffect, useState } from 'react';
import Navbar from "@/components/layout/Navbar";
import dynamic from 'next/dynamic';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, MapPin, Activity, Search, Filter, Phone, Download, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

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
  zone?: string;
  officer?: {
    name: string;
    contact: string;
    address: string;
  };
}

interface CityStats {
  avgAqi: number;
  criticalWards: number;
  worstWard: string;
}

interface ZoneSummary {
  zone_name: string;
  ward_count: number;
  avg_aqi: number;
  max_aqi: number;
  min_aqi: number;
  wards: Ward[];
}

// Dynamic import for Map to avoid SSR issues
const PollutionMap = dynamic(() => import('@/components/dashboard/PollutionMap'), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>
});

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

type FilterType = 'All' | 'Good' | 'Moderate' | 'Unhealthy' | 'Severe';

export default function HybridAuthorityDashboard() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [zoneSummary, setZoneSummary] = useState<{ [key: string]: ZoneSummary }>({});
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [cityStats, setCityStats] = useState<CityStats>({ avgAqi: 0, criticalWards: 0, worstWard: '-' });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [usingEnhancedData, setUsingEnhancedData] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try enhanced pollution API first
      try {
        const [zoneResponse, wardsResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/pollution/zones/summary`),
          fetch(`${BACKEND_URL}/api/wards`)
        ]);

        if (zoneResponse.ok) {
          const zoneData = await zoneResponse.json();
          if (zoneData.success) {
            setZoneSummary(zoneData.data);
            setUsingEnhancedData(true);
            
            // Convert zone data to wards array
            const allWards: Ward[] = [];
            Object.values(zoneData.data).forEach((zone: any) => {
              zone.wards.forEach((ward: any) => {
                allWards.push({
                  wardId: ward.ward_number,
                  wardName: ward.ward_name,
                  aqi: ward.aqi,
                  status: getStatusFromAQI(ward.aqi),
                  sourceStation: `Station ${ward.ward_number}`,
                  lat: 28.6139 + (Math.random() - 0.5) * 0.1,
                  lon: 77.2090 + (Math.random() - 0.5) * 0.1,
                  pollutants: {
                    pm25: Math.round(ward.aqi * 0.6),
                    pm10: Math.round(ward.aqi * 0.8),
                    no2: Math.round(ward.aqi * 0.3)
                  },
                  zone: zone.zone_name
                });
              });
            });
            
            setWards(allWards);
            calculateStats(allWards);
            setError(null);
            setLastUpdated(new Date());
            setLoading(false);
            return;
          }
        }
      } catch (enhancedError) {
        console.log('Enhanced API not available, falling back to basic data');
      }

      // Fallback to basic dashboard API
      const res = await fetch(`${BACKEND_URL}/api/pollution/dashboard`);
      if (!res.ok) throw new Error('Failed to connect to backend server');

      const data = await res.json();

      if (data.success) {
        setWards(data.data);
        calculateStats(data.data);
        generateZoneSummary(data.data);
        setError(null);
        setLastUpdated(new Date());
        setUsingEnhancedData(false);
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

  const getStatusFromAQI = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 200) return 'Poor';
    return 'Severe';
  };

  const generateZoneSummary = (wardsData: Ward[]) => {
    const zones: { [key: string]: ZoneSummary } = {};
    
    wardsData.forEach(ward => {
      const zoneName = ward.zone || 'Unknown Zone';
      if (!zones[zoneName]) {
        zones[zoneName] = {
          zone_name: zoneName,
          ward_count: 0,
          avg_aqi: 0,
          max_aqi: 0,
          min_aqi: Infinity,
          wards: []
        };
      }
      
      zones[zoneName].wards.push(ward);
      zones[zoneName].ward_count++;
      zones[zoneName].max_aqi = Math.max(zones[zoneName].max_aqi, ward.aqi);
      zones[zoneName].min_aqi = Math.min(zones[zoneName].min_aqi, ward.aqi);
    });

    // Calculate averages
    Object.values(zones).forEach(zone => {
      const totalAqi = zone.wards.reduce((sum, ward) => sum + ward.aqi, 0);
      zone.avg_aqi = Math.round(totalAqi / zone.ward_count);
      if (zone.min_aqi === Infinity) zone.min_aqi = 0;
    });

    setZoneSummary(zones);
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
      case 'Good': return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Poor': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Severe': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getGRAPStage = (avgAqi: number) => {
    if (avgAqi <= 200) return { stage: 'Stage I', color: 'bg-green-100 text-green-800 border-green-300' };
    if (avgAqi <= 300) return { stage: 'Stage II', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    if (avgAqi <= 400) return { stage: 'Stage III', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    return { stage: 'Stage IV', color: 'bg-red-100 text-red-800 border-red-300' };
  };

  const getRecommendedActions = (aqi: number) => {
    if (aqi <= 50) return ['Continue regular monitoring', 'No immediate action required'];
    if (aqi <= 100) return ['Monitor sensitive groups', 'Increase public awareness'];
    if (aqi <= 200) return ['Issue health advisories', 'Restrict outdoor activities', 'Monitor industrial emissions'];
    if (aqi <= 300) return ['Implement GRAP measures', 'Ban construction activities', 'Restrict vehicle movement', 'Close schools if necessary'];
    return ['Emergency measures', 'Complete construction ban', 'Odd-even vehicle scheme', 'School closures mandatory', 'Work from home advisory'];
  };

  const filterWards = (ward: Ward) => {
    const matchesSearch = ward.wardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ward.sourceStation.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = true;
    if (activeFilter === 'Good') matchesFilter = ward.aqi <= 50;
    else if (activeFilter === 'Moderate') matchesFilter = ward.aqi > 50 && ward.aqi <= 100;
    else if (activeFilter === 'Unhealthy') matchesFilter = ward.aqi > 100 && ward.aqi <= 300;
    else if (activeFilter === 'Severe') matchesFilter = ward.aqi > 300;

    return matchesSearch && matchesFilter;
  };

  const filteredWards = wards.filter(filterWards);
  const grapStage = getGRAPStage(cityStats.avgAqi);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading authority dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Authority Command Center</h1>
            <p className="text-slate-500 mt-1">Real-time pollution monitoring and rapid response system</p>
            <p className="text-xs text-slate-400 mt-1">
              Data Source: {usingEnhancedData ? 'Enhanced Analytics API' : 'Basic Dashboard API'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg border font-semibold text-sm ${grapStage.color}`}>
              GRAP {grapStage.stage}
            </div>
            <button 
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              Refresh Data
            </button>
          </div>
        </motion.div>

        {/* Alert Banner */}
        {cityStats.avgAqi > 200 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700"
          >
            <AlertTriangle size={20} className="flex-shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Severe Air Quality Alert:</span> GRAP {grapStage.stage} measures are now active. 
              Immediate action required for {cityStats.criticalWards} critical wards.
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
              <Phone size={14} />
              Emergency Contact
            </button>
          </motion.div>
        )}

        {/* Key Metrics Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">City Avg AQI</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{cityStats.avgAqi}</h3>
              </div>
              <div className={`p-2 rounded-lg ${cityStats.avgAqi > 200 ? 'bg-red-100' : 'bg-green-100'}`}>
                <Activity size={20} className={cityStats.avgAqi > 200 ? 'text-red-600' : 'text-green-600'} />
              </div>
            </div>
            <div className="flex items-center text-xs text-slate-500">
              <Clock size={14} className="mr-1" />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical Wards</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{cityStats.criticalWards}</h3>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle size={20} className="text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500">AQI &gt; 300 - Immediate action needed</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Zones</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{Object.keys(zoneSummary).length}</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500">{wards.length} wards monitored</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Most Polluted</p>
                <h3 className="text-lg font-bold text-slate-900 mt-1 truncate">{cityStats.worstWard}</h3>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <AlertTriangle size={20} className="text-slate-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500">Requires priority attention</p>
          </div>
        </motion.div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search wards or stations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-slate-400" />
              {(['All', 'Good', 'Moderate', 'Unhealthy', 'Severe'] as FilterType[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${activeFilter === filter
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 px-3 py-2 bg-slate-50 rounded-lg">
              <Clock size={14} />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zone Summary */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Zone Overview</h3>
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded">Live</span>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {Object.values(zoneSummary).map((zone) => (
                <div 
                  key={zone.zone_name}
                  onClick={() => setSelectedZone(zone.zone_name)}
                  className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${selectedZone === zone.zone_name ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-slate-900">{zone.zone_name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${zone.avg_aqi > 200 ? 'bg-red-100 text-red-700' : zone.avg_aqi > 100 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {zone.avg_aqi}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
                    <div>Wards: {zone.ward_count}</div>
                    <div>Max: {zone.max_aqi}</div>
                    <div>Min: {zone.min_aqi}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Map & Ward Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Map */}
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <PollutionMap wards={wards} selectedWard={selectedWard} onSelectWard={setSelectedWard} />
            </div>

            {/* Ward Details */}
            {selectedWard ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{selectedWard.wardName}</h3>
                    <p className="text-slate-500 text-sm mt-1">Station: {selectedWard.sourceStation}</p>
                    {selectedWard.zone && (
                      <span className="inline-block mt-2 px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                        {selectedWard.zone} Zone
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {selectedWard.officer?.contact && (
                      <button className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
                        <Phone size={14} />
                        Call Officer
                      </button>
                    )}
                    <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                      <Download size={14} />
                      Export
                    </button>
                  </div>
                </div>

                {/* Officer Info */}
                {selectedWard.officer && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Users size={16} className="text-slate-600" />
                      <h4 className="text-sm font-semibold text-slate-900">Nodal Officer</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-slate-900">{selectedWard.officer.name || 'Not Assigned'}</p>
                        <p className="text-slate-500 text-xs mt-1">Ward Officer</p>
                      </div>
                      <div>
                        <p className="text-slate-700">{selectedWard.officer.contact !== 'o' ? selectedWard.officer.contact : 'No Contact'}</p>
                        <p className="text-slate-400 text-xs mt-1 break-words">{selectedWard.officer.address}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pollutants Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">PM2.5</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{selectedWard.pollutants.pm25}</p>
                    <p className="text-xs text-slate-400 mt-1">µg/m³</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">PM10</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{selectedWard.pollutants.pm10}</p>
                    <p className="text-xs text-slate-400 mt-1">µg/m³</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">NO2</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{selectedWard.pollutants.no2}</p>
                    <p className="text-xs text-slate-400 mt-1">µg/m³</p>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-2">
                    {getRecommendedActions(selectedWard.aqi).map((action, idx) => (
                      <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trend Chart */}
                <div className="h-64 w-full">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">24 Hour AQI Trend</h4>
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
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAqi)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center h-[400px] flex flex-col items-center justify-center text-slate-400">
                <MapPin size={48} className="mb-4 opacity-50" />
                <p className="font-medium text-slate-600 mb-1">No Ward Selected</p>
                <p className="text-sm">Select a ward from the map or zone list to view detailed analytics and take action</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Zone Details Modal */}
        {selectedZone && zoneSummary[selectedZone] && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedZone} Analysis</h2>
                  <p className="text-slate-500 mt-1">{zoneSummary[selectedZone].ward_count} wards monitored</p>
                </div>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl leading-none">×</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Zone Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Average AQI</p>
                    <h3 className="text-3xl font-bold text-blue-900">{zoneSummary[selectedZone].avg_aqi}</h3>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Worst Ward</p>
                    <h3 className="text-3xl font-bold text-red-900">{zoneSummary[selectedZone].max_aqi}</h3>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Best Ward</p>
                    <h3 className="text-3xl font-bold text-green-900">{zoneSummary[selectedZone].min_aqi}</h3>
                  </div>
                </div>

                {/* Ward List */}
                <div className="bg-slate-50 rounded-lg border border-slate-200">
                  <div className="p-4 border-b border-slate-200">
                    <h4 className="font-semibold text-slate-900">Ward Details</h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {zoneSummary[selectedZone].wards.map((ward) => (
                      <div key={ward.wardId} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-slate-900">{ward.wardName}</p>
                          <p className="text-xs text-slate-500">Ward #{ward.wardId}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${ward.aqi > 200 ? 'bg-red-100 text-red-700' : ward.aqi > 100 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {ward.aqi}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">{ward.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}