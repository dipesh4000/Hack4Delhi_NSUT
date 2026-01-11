"use client";

import { useEffect, useState } from 'react';
// Navbar replaced by sidebar in authority layout
import dynamic from 'next/dynamic';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, TrendingUp, MapPin, Activity, Search, Filter, Phone, Download, Clock, Users, Zap, Shield, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

// Interfaces
interface ZoneSummary {
  zone_name: string;
  ward_count: number;
  avg_aqi: number;
  max_aqi: number;
  min_aqi: number;
  dominant_pollutants: { [key: string]: number };
  wards: Array<{
    ward_number: string;
    ward_name: string;
    aqi: number;
    dominant_pollutant: string;
  }>;
}

interface Hotspot {
  ward_number: string;
  ward_name: string;
  zone: string;
  aqi: number;
  category: {
    level: string;
    color: string;
    category: string;
  };
  dominant_pollutant: string;
  severity_score: number;
}

interface DailyReport {
  report_date: string;
  generated_at: string;
  city_overview: {
    total_zones: number;
    total_wards: number;
    city_avg_aqi: number;
    worst_zone: ZoneSummary;
    best_zone: ZoneSummary;
  };
  zone_summary: { [key: string]: ZoneSummary };
  hotspots: Hotspot[];
  recommendations: {
    immediate_actions: string[];
    policy_suggestions: string[];
    citizen_advisories: string[];
  };
}

const PollutionMap = dynamic(() => import('@/components/dashboard/PollutionMap'), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>
});

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export default function EnhancedAuthorityDashboard() {
  const [zoneSummary, setZoneSummary] = useState<{ [key: string]: ZoneSummary }>({});
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [systemHealth, setSystemHealth] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch zone summary
      const zoneResponse = await fetch(`${BACKEND_URL}/api/pollution/zones/summary`);
      const zoneData = await zoneResponse.json();
      
      // Fetch hotspots
      const hotspotsResponse = await fetch(`${BACKEND_URL}/api/pollution/hotspots?limit=10`);
      const hotspotsData = await hotspotsResponse.json();
      
      // Fetch daily report
      const reportResponse = await fetch(`${BACKEND_URL}/api/pollution/report/daily`);
      const reportData = await reportResponse.json();
      
      // Fetch system health
      const healthResponse = await fetch(`${BACKEND_URL}/api/pollution/health`);
      const healthData = await healthResponse.json();

      if (zoneData.success) setZoneSummary(zoneData.data);
      if (hotspotsData.success) setHotspots(hotspotsData.data.hotspots);
      if (reportData.success) setDailyReport(reportData.data);
      if (healthData.success) setSystemHealth(healthData.data);
      
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerDataUpdate = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/pollution/update`, { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        // Refresh dashboard after update
        setTimeout(fetchDashboardData, 2000);
      }
    } catch (err) {
      console.error('Error triggering update:', err);
    }
  };

  const getStatusColor = (category: string) => {
    switch (category) {
      case 'GOOD': return 'bg-green-100 text-green-800 border-green-200';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'UNHEALTHY_SENSITIVE': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'UNHEALTHY': return 'bg-red-100 text-red-800 border-red-200';
      case 'VERY_UNHEALTHY': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'HAZARDOUS': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getGRAPStage = (avgAqi: number) => {
    if (avgAqi <= 200) return { stage: 'Stage I', color: 'bg-green-100 text-green-800 border-green-300' };
    if (avgAqi <= 300) return { stage: 'Stage II', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    if (avgAqi <= 400) return { stage: 'Stage III', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    return { stage: 'Stage IV', color: 'bg-red-100 text-red-800 border-red-300' };
  };

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

  const cityStats = dailyReport?.city_overview || {
    total_zones: Object.keys(zoneSummary).length,
    total_wards: Object.values(zoneSummary).reduce((sum, zone) => sum + zone.ward_count, 0),
    city_avg_aqi: Math.round(Object.values(zoneSummary).reduce((sum, zone) => sum + zone.avg_aqi, 0) / Object.keys(zoneSummary).length),
    worst_zone: Object.values(zoneSummary).reduce((worst, zone) => zone.avg_aqi > worst.avg_aqi ? zone : worst, Object.values(zoneSummary)[0]),
    best_zone: Object.values(zoneSummary).reduce((best, zone) => zone.avg_aqi < best.avg_aqi ? zone : best, Object.values(zoneSummary)[0])
  };

  const grapStage = getGRAPStage(cityStats.city_avg_aqi);
  const criticalWards = hotspots.filter(h => h.aqi > 300).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Authority Command Center</h1>
            <p className="text-slate-500 mt-1">Real-time pollution monitoring and rapid response system</p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg border font-semibold text-sm ${grapStage.color}`}>
              GRAP {grapStage.stage}
            </div>
            <button 
              onClick={triggerDataUpdate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              Update Data
            </button>
          </div>
        </motion.div>

        {/* Alert Banner */}
        {cityStats.city_avg_aqi > 200 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700"
          >
            <AlertTriangle size={20} className="flex-shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Severe Air Quality Alert:</span> GRAP {grapStage.stage} measures are now active. 
              Immediate action required for {criticalWards} critical wards.
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
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{cityStats.city_avg_aqi}</h3>
              </div>
              <div className={`p-2 rounded-lg ${cityStats.city_avg_aqi > 200 ? 'bg-red-100' : 'bg-green-100'}`}>
                <Activity size={20} className={cityStats.city_avg_aqi > 200 ? 'text-red-600' : 'text-green-600'} />
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
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{criticalWards}</h3>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle size={20} className="text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500">AQI {'>'} 300 - Immediate action needed</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Zones</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{cityStats.total_zones}</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500">{cityStats.total_wards} wards monitored</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Status</p>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {systemHealth?.scheduler?.status === 'running' ? '🟢 Active' : '🔴 Offline'}
                </h3>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <Shield size={20} className="text-slate-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              API: {systemHealth?.apiConnectivity?.status === 'connected' ? 'Connected' : 'Disconnected'}
            </p>
          </div>
        </motion.div>

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
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(zone.dominant_pollutants).slice(0, 2).map(([pollutant, count]) => (
                      <span key={pollutant} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {pollutant.toUpperCase()}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hotspots & Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Hotspots Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Critical Hotspots</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 border border-red-200 rounded">
                    {hotspots.length} Active
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-slate-500 font-medium text-xs">Ward</th>
                      <th className="px-4 py-3 text-left text-slate-500 font-medium text-xs">Zone</th>
                      <th className="px-4 py-3 text-right text-slate-500 font-medium text-xs">AQI</th>
                      <th className="px-4 py-3 text-left text-slate-500 font-medium text-xs">Pollutant</th>
                      <th className="px-4 py-3 text-right text-slate-500 font-medium text-xs">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotspots.slice(0, 10).map((hotspot) => (
                      <tr key={hotspot.ward_number} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{hotspot.ward_name}</div>
                          <div className="text-xs text-slate-400">#{hotspot.ward_number}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{hotspot.zone}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(hotspot.category.category)}`}>
                            {hotspot.aqi}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {hotspot.dominant_pollutant.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          {hotspot.severity_score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations */}
            {dailyReport?.recommendations && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Immediate Actions Required
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Policy Actions</h4>
                    <ul className="space-y-2">
                      {dailyReport.recommendations.immediate_actions.map((action, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                            {idx + 1}
                          </span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Citizen Advisories</h4>
                    <ul className="space-y-2">
                      {dailyReport.recommendations.citizen_advisories.map((advisory, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                            📢
                          </span>
                          {advisory}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
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
                      <div key={ward.ward_number} className="flex justify-between items-center p-3 border-b border-slate-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-slate-900">{ward.ward_name}</p>
                          <p className="text-xs text-slate-500">Ward #{ward.ward_number}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${ward.aqi > 200 ? 'bg-red-100 text-red-700' : ward.aqi > 100 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {ward.aqi}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">{ward.dominant_pollutant.toUpperCase()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dominant Pollutants Chart */}
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <h4 className="font-semibold text-slate-900 mb-4">Dominant Pollutants Distribution</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(zoneSummary[selectedZone].dominant_pollutants).map(([pollutant, count]) => (
                      <div key={pollutant} className="text-center">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                          {count}
                        </div>
                        <p className="text-sm font-medium text-slate-700">{pollutant.toUpperCase()}</p>
                        <p className="text-xs text-slate-500">{Math.round((count / zoneSummary[selectedZone].ward_count) * 100)}% wards</p>
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