"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Wind, 
  Thermometer, 
  Droplets, 
  Eye, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  Zap,
  BarChart3,
  Target,
  RefreshCw
} from 'lucide-react';
import dynamic from 'next/dynamic';

const DelhiGeographicalMap = dynamic(() => import('@/components/maps/DelhiGeographicalMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>
});

interface PollutantData {
  name: string;
  value: number;
  unit: string;
  limit: number;
  status: 'good' | 'moderate' | 'poor' | 'very_poor' | 'severe';
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface MonitoringStation {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  wardId: string;
  wardName: string;
  aqi: number;
  status: string;
  pollutants: PollutantData[];
  lastUpdated: string;
  isOnline: boolean;
}

export default function MonitoringPage() {
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<MonitoringStation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
    try {
      setRefreshing(true);
      
      // Generate monitoring stations data
      const stationsData: MonitoringStation[] = Array.from({ length: 50 }, (_, index) => {
        const wardId = Math.floor(Math.random() * 250) + 1;
        const aqi = Math.floor(Math.random() * 400) + 50;
        
        const pollutants: PollutantData[] = [
          {
            name: 'PM2.5',
            value: Math.floor(Math.random() * 200) + 20,
            unit: 'μg/m³',
            limit: 60,
            status: Math.random() > 0.5 ? 'poor' : 'moderate',
            trend: Math.random() > 0.5 ? 'up' : 'down',
            change: Math.floor(Math.random() * 20) - 10
          },
          {
            name: 'PM10',
            value: Math.floor(Math.random() * 300) + 30,
            unit: 'μg/m³',
            limit: 100,
            status: Math.random() > 0.5 ? 'poor' : 'moderate',
            trend: Math.random() > 0.5 ? 'up' : 'down',
            change: Math.floor(Math.random() * 25) - 12
          },
          {
            name: 'NO2',
            value: Math.floor(Math.random() * 80) + 10,
            unit: 'μg/m³',
            limit: 80,
            status: Math.random() > 0.5 ? 'moderate' : 'good',
            trend: Math.random() > 0.5 ? 'up' : 'down',
            change: Math.floor(Math.random() * 15) - 7
          },
          {
            name: 'SO2',
            value: Math.floor(Math.random() * 60) + 5,
            unit: 'μg/m³',
            limit: 80,
            status: Math.random() > 0.5 ? 'good' : 'moderate',
            trend: Math.random() > 0.5 ? 'up' : 'down',
            change: Math.floor(Math.random() * 10) - 5
          },
          {
            name: 'CO',
            value: Math.floor(Math.random() * 40) + 5,
            unit: 'mg/m³',
            limit: 30,
            status: Math.random() > 0.5 ? 'moderate' : 'good',
            trend: Math.random() > 0.5 ? 'up' : 'down',
            change: Math.floor(Math.random() * 8) - 4
          },
          {
            name: 'O3',
            value: Math.floor(Math.random() * 120) + 20,
            unit: 'μg/m³',
            limit: 180,
            status: Math.random() > 0.5 ? 'moderate' : 'good',
            trend: Math.random() > 0.5 ? 'up' : 'down',
            change: Math.floor(Math.random() * 12) - 6
          }
        ];

        return {
          id: `STATION-${(index + 1).toString().padStart(3, '0')}`,
          name: `${['Central', 'North', 'South', 'East', 'West'][Math.floor(Math.random() * 5)]} Delhi Station ${index + 1}`,
          location: {
            lat: 28.6139 + (Math.random() - 0.5) * 0.5,
            lng: 77.2090 + (Math.random() - 0.5) * 0.5
          },
          wardId: wardId.toString(),
          wardName: `Ward ${wardId}`,
          aqi,
          status: getStatusFromAQI(aqi),
          pollutants,
          lastUpdated: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString(),
          isOnline: Math.random() > 0.1 // 90% uptime
        };
      });

      setStations(stationsData);
      if (!selectedStation && stationsData.length > 0) {
        setSelectedStation(stationsData[0]);
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusFromAQI = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 200) return 'Poor';
    if (aqi <= 300) return 'Very Poor';
    return 'Severe';
  };

  const getPollutantStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-orange-600 bg-orange-50';
      case 'very_poor': return 'text-red-600 bg-red-50';
      case 'severe': return 'text-red-800 bg-red-100';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const onlineStations = stations.filter(s => s.isOnline).length;
  const avgAQI = stations.length > 0 ? Math.round(stations.reduce((sum, s) => sum + s.aqi, 0) / stations.length) : 0;
  const criticalStations = stations.filter(s => s.aqi > 300).length;
  const exceedingLimits = selectedStation ? selectedStation.pollutants.filter(p => p.value > p.limit).length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header with Refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Real-time Monitoring</h2>
            <p className="text-slate-600">Live air quality data from monitoring stations</p>
          </div>
          <button
            onClick={fetchMonitoringData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Online Stations</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{onlineStations}</p>
                <p className="text-sm text-slate-500 mt-1">of {stations.length} total</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
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
                <p className="text-sm font-medium text-slate-600">Average AQI</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{avgAQI}</p>
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={14} />
                  +8 from yesterday
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
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
                <p className="text-sm font-medium text-slate-600">Critical Stations</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{criticalStations}</p>
                <p className="text-sm text-orange-600 mt-1">AQI &gt; 300</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
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
                <p className="text-sm font-medium text-slate-600">Exceeding Limits</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{exceedingLimits}</p>
                <p className="text-sm text-slate-500 mt-1">pollutants</p>
              </div>
              <Target className="w-8 h-8 text-orange-600" />
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monitoring Stations Map */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Monitoring Stations</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock size={16} />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="h-[400px] bg-slate-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Interactive monitoring stations map</p>
                <p className="text-sm text-slate-400 mt-1">{onlineStations} stations online</p>
              </div>
            </div>
          </div>

          {/* Station List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Stations</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {stations.slice(0, 10).map((station) => (
                <div
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedStation?.id === station.id ? 'bg-blue-50 border-blue-100' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${station.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <h4 className="font-medium text-slate-900 text-sm">{station.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500">{station.wardName}</p>
                      <p className="text-xs text-slate-400">
                        Updated {new Date(station.lastUpdated).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">{station.aqi}</div>
                      <div className={`text-xs font-medium ${
                        station.aqi > 200 ? 'text-red-600' : 
                        station.aqi > 100 ? 'text-orange-600' : 
                        station.aqi > 50 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {station.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Station Details */}
        {selectedStation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{selectedStation.name}</h3>
                <p className="text-slate-600">{selectedStation.wardName} • AQI: {selectedStation.aqi}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${selectedStation.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-slate-600">
                  {selectedStation.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Pollutants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedStation.pollutants.map((pollutant) => (
                <div key={pollutant.name} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-900">{pollutant.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPollutantStatusColor(pollutant.status)}`}>
                      {pollutant.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-slate-900">{pollutant.value}</span>
                      <span className="text-sm text-slate-500">{pollutant.unit}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Limit: {pollutant.limit} {pollutant.unit}</span>
                      <div className={`flex items-center gap-1 ${
                        pollutant.trend === 'up' ? 'text-red-600' : 
                        pollutant.trend === 'down' ? 'text-green-600' : 'text-slate-600'
                      }`}>
                        {pollutant.trend === 'up' ? <TrendingUp size={14} /> : 
                         pollutant.trend === 'down' ? <TrendingDown size={14} /> : null}
                        <span>{pollutant.change > 0 ? '+' : ''}{pollutant.change}</span>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          pollutant.value > pollutant.limit ? 'bg-red-500' : 
                          pollutant.value > pollutant.limit * 0.8 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((pollutant.value / pollutant.limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Station Actions */}
            <div className="mt-6 flex gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                View Historical Data
              </button>
              <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium">
                Generate Report
              </button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                Set Alert Threshold
              </button>
            </div>
          </motion.div>
        )}
      </div>
  );
}