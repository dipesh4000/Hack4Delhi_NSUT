"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, MapPin, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import AuthorityLayout from '@/components/authority/AuthorityLayout';
import dynamic from 'next/dynamic';

const WardGeographicalMap = dynamic(() => import('@/components/maps/WardGeographicalMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">Loading Map...</div>
});

interface Ward {
  wardId: string;
  wardName: string;
  aqi: number;
  status: string;
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number;
    o3: number;
  };
  grapLevel: number;
  actionsPending: number;
  lastUpdated: string;
}

export default function WardAnalysisPage() {
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWardData();
  }, []);

  const fetchWardData = async () => {
    try {
      const wardData: Ward[] = Array.from({ length: 250 }, (_, index) => {
        const wardId = (index + 1).toString();
        const aqi = Math.floor(Math.random() * 400) + 50;
        
        return {
          wardId,
          wardName: `Ward ${wardId}`,
          aqi,
          status: getStatusFromAQI(aqi),
          pollutants: {
            pm25: Math.floor(Math.random() * 200) + 20,
            pm10: Math.floor(Math.random() * 300) + 30,
            no2: Math.floor(Math.random() * 80) + 10,
            so2: Math.floor(Math.random() * 60) + 5,
            co: Math.floor(Math.random() * 40) + 5,
            o3: Math.floor(Math.random() * 120) + 20
          },
          grapLevel: aqi > 300 ? 4 : aqi > 200 ? 3 : aqi > 100 ? 2 : 1,
          actionsPending: Math.floor(Math.random() * 10),
          lastUpdated: new Date().toISOString()
        };
      });

      setWards(wardData);
      setSelectedWard(wardData[0]);
    } catch (error) {
      console.error('Error fetching ward data:', error);
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

  const downloadWardReport = async (ward: Ward) => {
    const reportData = {
      wardName: ward.wardName,
      aqi: ward.aqi,
      status: ward.status,
      pollutants: ward.pollutants,
      grapLevel: ward.grapLevel,
      actionsPending: ward.actionsPending,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ward.wardName}_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AuthorityLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading Ward Analysis...</p>
          </div>
        </div>
      </AuthorityLayout>
    );
  }

  return (
    <AuthorityLayout>
      <div className="space-y-6 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Ward Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Ward</h3>
            <select 
              className="w-full p-3 border border-slate-300 rounded-lg"
              value={selectedWard?.wardId || ''}
              onChange={(e) => {
                const ward = wards.find(w => w.wardId === e.target.value);
                setSelectedWard(ward || null);
              }}
            >
              {wards.map(ward => (
                <option key={ward.wardId} value={ward.wardId}>
                  {ward.wardName} (AQI: {ward.aqi})
                </option>
              ))}
            </select>
          </div>

          {/* Ward Stats */}
          {selectedWard && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-600">Current AQI</p>
                  <Activity className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{selectedWard.aqi}</p>
                <p className="text-sm text-red-600 mt-1">{selectedWard.status}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-600">GRAP Level</p>
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{selectedWard.grapLevel}</p>
                <p className="text-sm text-orange-600 mt-1">Stage {selectedWard.grapLevel}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-slate-600">Pending Actions</p>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-slate-900">{selectedWard.actionsPending}</p>
                <p className="text-sm text-blue-600 mt-1">In progress</p>
              </div>
            </>
          )}
        </div>

        {selectedWard && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ward Map */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">{selectedWard.wardName} Map</h3>
                <button
                  onClick={() => downloadWardReport(selectedWard)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Download size={16} />
                  Download Report
                </button>
              </div>
              <WardGeographicalMap ward={selectedWard} />
            </motion.div>

            {/* Pollutant Details */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Pollutant Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-slate-600">PM2.5</p>
                  <p className="text-2xl font-bold text-red-600">{selectedWard.pollutants.pm25}</p>
                  <p className="text-xs text-slate-500">μg/m³</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-slate-600">PM10</p>
                  <p className="text-2xl font-bold text-orange-600">{selectedWard.pollutants.pm10}</p>
                  <p className="text-xs text-slate-500">μg/m³</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-slate-600">NO2</p>
                  <p className="text-2xl font-bold text-yellow-600">{selectedWard.pollutants.no2}</p>
                  <p className="text-xs text-slate-500">μg/m³</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-slate-600">SO2</p>
                  <p className="text-2xl font-bold text-green-600">{selectedWard.pollutants.so2}</p>
                  <p className="text-xs text-slate-500">μg/m³</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-600">CO</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedWard.pollutants.co}</p>
                  <p className="text-xs text-slate-500">mg/m³</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-slate-600">O3</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedWard.pollutants.o3}</p>
                  <p className="text-xs text-slate-500">μg/m³</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AuthorityLayout>
  );
}