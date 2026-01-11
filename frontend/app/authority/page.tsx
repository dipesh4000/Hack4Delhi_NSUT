"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Activity, 
  Shield,
  Target,
  Clock
} from 'lucide-react';
import dynamic from 'next/dynamic';

const DelhiGeographicalMap = dynamic(() => import('@/components/maps/DelhiGeographicalMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>
});

interface Ward {
  wardId: string;
  wardName: string;
  aqi: number;
  status: string;
  ranking: number;
  coordinates: { lat: number; lng: number };
  pollutionSources: {
    vehicular: number;
    industrial: number;
    construction: number;
    residential: number;
  };
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number;
    o3: number;
    aqi: number;
  };
  grapLevel: number;
  actionsPending: number;
  lastUpdated: string;
}

export default function AuthorityDashboard() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [loading, setLoading] = useState(true);
  const [grapStatus, setGrapStatus] = useState(3);
  const [emergencyAlerts, setEmergencyAlerts] = useState(5);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const wardData: Ward[] = Array.from({ length: 250 }, (_, index) => {
        const wardId = (index + 1).toString();
        const aqi = Math.floor(Math.random() * 400) + 50;
        const pm25 = Math.floor(Math.random() * 200) + 20;
        const pm10 = Math.floor(Math.random() * 300) + 30;
        
        return {
          wardId,
          wardName: `Ward ${wardId}`,
          aqi,
          status: getStatusFromAQI(aqi),
          ranking: index + 1,
          coordinates: {
            lat: 28.6139 + (Math.random() - 0.5) * 0.5,
            lng: 77.2090 + (Math.random() - 0.5) * 0.5
          },
          pollutionSources: {
            vehicular: Math.floor(Math.random() * 50) + 20,
            industrial: Math.floor(Math.random() * 40) + 10,
            construction: Math.floor(Math.random() * 30) + 5,
            residential: Math.floor(Math.random() * 25) + 5
          },
          pollutants: {
            pm25,
            pm10,
            no2: Math.floor(Math.random() * 80) + 10,
            so2: Math.floor(Math.random() * 60) + 5,
            co: Math.floor(Math.random() * 40) + 5,
            o3: Math.floor(Math.random() * 120) + 20,
            aqi
          },
          grapLevel: aqi > 300 ? 4 : aqi > 200 ? 3 : aqi > 100 ? 2 : 1,
          actionsPending: Math.floor(Math.random() * 10),
          lastUpdated: new Date().toISOString()
        };
      });

      const sortedWards = wardData.sort((a, b) => b.aqi - a.aqi);
      setWards(sortedWards);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromAQI = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 200) return 'Poor';
    if (aqi <= 300) return 'Very Poor';
    return 'Severe';
  };

  const getGrapActions = (level: number) => {
    const actions = {
      1: ['Monitor air quality', 'Public awareness campaigns'],
      2: ['Increase public transport', 'Water sprinkling on roads'],
      3: ['Ban construction activities', 'Odd-even vehicle restrictions'],
      4: ['Complete lockdown', 'Emergency health measures', 'Industrial shutdown']
    };
    return actions[level as keyof typeof actions] || [];
  };

  const criticalWards = wards.filter(w => w.aqi > 300).slice(0, 5);
  const avgAQI = wards.length > 0 ? Math.round(wards.reduce((sum, w) => sum + w.aqi, 0) / wards.length) : 0;
  const severeWards = wards.filter(w => w.aqi > 200).length;
  const pendingActions = wards.reduce((sum, w) => sum + w.actionsPending, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading Authority Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Critical Alerts Banner */}
        {emergencyAlerts > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Critical Air Quality Alert</h3>
                  <p className="text-sm text-red-700">{emergencyAlerts} wards require immediate action</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                Take Action
              </button>
            </div>
          </motion.div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Delhi Avg AQI</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{avgAQI}</p>
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={14} />
                  +12 from yesterday
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Severe Wards</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{severeWards}</p>
                <p className="text-sm text-orange-600 mt-1 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  Requires action
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">GRAP Stage</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{grapStatus}</p>
                <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                  <Shield size={14} />
                  Active measures
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Actions</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{pendingActions}</p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <Target size={14} />
                  In progress
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Delhi Map */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Delhi Pollution Map</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock size={16} />
                <span>Updated 2 min ago</span>
              </div>
            </div>
            <DelhiGeographicalMap wards={wards} onWardSelect={(ward) => setSelectedWard(ward as Ward)} />
          </motion.div>

          {/* Critical Wards */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Critical Wards</h3>
            <div className="space-y-4">
              {criticalWards.map((ward, index) => (
                <div key={ward.wardId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{ward.wardName}</p>
                    <p className="text-sm text-slate-600">AQI: {ward.aqi}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
                      GRAP {ward.grapLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* GRAP Actions & Pollutant Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GRAP Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">GRAP Stage {grapStatus} Actions</h3>
            </div>
            <div className="space-y-3">
              {getGrapActions(grapStatus).map((action, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-slate-700">{action}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Implement Actions
            </button>
          </motion.div>

          {/* Pollutant Breakdown */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Pollutant Analysis</h3>
            {selectedWard ? (
              <div className="space-y-4">
                <h4 className="font-medium text-slate-700">{selectedWard.wardName}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">PM2.5</p>
                    <p className="text-lg font-bold text-slate-900">{selectedWard.pollutants.pm25}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">PM10</p>
                    <p className="text-lg font-bold text-slate-900">{selectedWard.pollutants.pm10}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">NO2</p>
                    <p className="text-lg font-bold text-slate-900">{selectedWard.pollutants.no2}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">SO2</p>
                    <p className="text-lg font-bold text-slate-900">{selectedWard.pollutants.so2}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Select a ward on the map to view detailed pollutant analysis</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Activities */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Emergency action triggered in Ward 45</p>
                <p className="text-xs text-slate-600">AQI exceeded 400 - GRAP Stage 4 activated</p>
              </div>
              <span className="text-xs text-slate-500">2 min ago</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Construction ban implemented in 15 wards</p>
                <p className="text-xs text-slate-600">GRAP Stage 3 measures activated</p>
              </div>
              <span className="text-xs text-slate-500">15 min ago</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingDown className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">AQI improvement in South Delhi</p>
                <p className="text-xs text-slate-600">Average AQI reduced by 25 points</p>
              </div>
              <span className="text-xs text-slate-500">1 hour ago</span>
            </div>
          </div>
        </motion.div>
      </div>
  );
}