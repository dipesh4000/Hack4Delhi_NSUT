"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, TrendingUp, TrendingDown, AlertTriangle, Shield, Clock, Users, Zap, Wind, Activity } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface WardAnalysis {
  ward_info: {
    ward_number: string;
    ward_name: string;
    zone: string;
    last_updated: string;
  };
  current_status: {
    aqi: number;
    category: {
      level: string;
      color: string;
      category: string;
    };
    dominant_pollutant: string;
    pollutant_levels: {
      pm25: number;
      pm10: number;
      no2: number;
      o3: number;
      so2: number;
      co: number;
    };
  };
  pollution_sources: {
    [key: string]: {
      contribution_percentage: number;
      confidence: number;
      primary_pollutants: string[];
    };
  };
  health_recommendations: {
    general: string[];
    sensitive_groups: string[];
    outdoor_activities: string;
    mask_recommendation: string;
  };
  optimal_times: {
    optimal_days: Array<{
      date: string;
      aqi_forecast: number;
      category: string;
      recommendation: string;
    }>;
    best_day: any;
    total_good_days: number;
  };
  trends: {
    current_aqi: number;
    trend_direction: string;
    avg_forecast: number;
    improvement_expected: boolean;
  };
  grap_recommendations: {
    stage: string;
    recommended_actions: string[];
    emergency_level: string;
  };
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316'];

export default function WardDetailsPage() {
  const params = useParams();
  const wardId = params.wardId as string;
  
  const [wardData, setWardData] = useState<WardAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wardId) {
      fetchWardData();
    }
  }, [wardId]);

  const fetchWardData = async () => {
    try {
      setLoading(true);
      
      // Try enhanced pollution API first
      try {
        const response = await fetch(`${BACKEND_URL}/api/pollution/ward/${wardId}/analysis`);
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            setWardData(result.data);
            setError(null);
            setLoading(false);
            return;
          }
        }
      } catch (enhancedError) {
        console.log('Enhanced API not available, trying basic API');
      }

      // Fallback to basic ward API
      try {
        const response = await fetch(`${BACKEND_URL}/api/wards/${wardId}`);
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            // Convert basic ward data to enhanced format
            const basicWard = result.data;
            const mockEnhancedData: WardAnalysis = {
              ward_info: {
                ward_number: wardId,
                ward_name: basicWard.wardName || `Ward ${wardId}`,
                zone: basicWard.zone || 'Unknown Zone',
                last_updated: new Date().toISOString()
              },
              current_status: {
                aqi: basicWard.aqi || 150,
                category: {
                  level: basicWard.status || 'Moderate',
                  color: '#f59e0b',
                  category: 'MODERATE'
                },
                dominant_pollutant: 'pm25',
                pollutant_levels: {
                  pm25: basicWard.pollutants?.pm25 || Math.round((basicWard.aqi || 150) * 0.6),
                  pm10: basicWard.pollutants?.pm10 || Math.round((basicWard.aqi || 150) * 0.8),
                  no2: basicWard.pollutants?.no2 || Math.round((basicWard.aqi || 150) * 0.3),
                  o3: Math.round((basicWard.aqi || 150) * 0.2),
                  so2: Math.round((basicWard.aqi || 150) * 0.1),
                  co: Math.round((basicWard.aqi || 150) * 0.15)
                }
              },
              pollution_sources: {
                vehicular: { contribution_percentage: 45, confidence: 0.8, primary_pollutants: ['no2', 'co'] },
                industrial: { contribution_percentage: 30, confidence: 0.7, primary_pollutants: ['so2', 'pm10'] },
                construction: { contribution_percentage: 25, confidence: 0.6, primary_pollutants: ['pm10', 'pm25'] }
              },
              health_recommendations: {
                general: [
                  basicWard.aqi > 200 ? 'Avoid prolonged outdoor activities' : 'Limit strenuous outdoor activities',
                  basicWard.aqi > 150 ? 'Consider wearing a mask when outdoors' : 'Monitor air quality regularly'
                ],
                sensitive_groups: [
                  'People with respiratory conditions should stay indoors',
                  'Children and elderly should avoid outdoor activities'
                ],
                outdoor_activities: basicWard.aqi > 200 ? 'avoid' : basicWard.aqi > 100 ? 'limited' : 'allowed',
                mask_recommendation: basicWard.aqi > 200 ? 'required' : basicWard.aqi > 100 ? 'recommended' : 'optional'
              },
              optimal_times: {
                optimal_days: [],
                best_day: null,
                total_good_days: 0
              },
              trends: {
                current_aqi: basicWard.aqi || 150,
                trend_direction: 'stable',
                avg_forecast: basicWard.aqi || 150,
                improvement_expected: false
              },
              grap_recommendations: {
                stage: basicWard.aqi > 300 ? 'Stage III - Severe' : basicWard.aqi > 200 ? 'Stage II - Very Poor' : 'Stage I - Poor',
                recommended_actions: [
                  'Monitor air quality regularly',
                  'Implement dust control measures',
                  'Restrict construction activities during peak hours'
                ],
                emergency_level: basicWard.aqi > 300 ? 'high' : basicWard.aqi > 200 ? 'medium' : 'low'
              }
            };
            
            setWardData(mockEnhancedData);
            setError(null);
            setLoading(false);
            return;
          }
        }
      } catch (basicError) {
        console.log('Basic API also failed');
      }

      // Final fallback - generate mock data
      const mockData: WardAnalysis = {
        ward_info: {
          ward_number: wardId,
          ward_name: `Ward ${wardId}`,
          zone: 'Demo Zone',
          last_updated: new Date().toISOString()
        },
        current_status: {
          aqi: 156,
          category: {
            level: 'Unhealthy',
            color: '#f59e0b',
            category: 'UNHEALTHY'
          },
          dominant_pollutant: 'pm25',
          pollutant_levels: {
            pm25: 94,
            pm10: 125,
            no2: 47,
            o3: 31,
            so2: 16,
            co: 23
          }
        },
        pollution_sources: {
          vehicular: { contribution_percentage: 45, confidence: 0.8, primary_pollutants: ['no2', 'co'] },
          industrial: { contribution_percentage: 30, confidence: 0.7, primary_pollutants: ['so2', 'pm10'] },
          construction: { contribution_percentage: 25, confidence: 0.6, primary_pollutants: ['pm10', 'pm25'] }
        },
        health_recommendations: {
          general: [
            'Avoid prolonged outdoor activities',
            'Consider wearing a mask when outdoors',
            'Keep windows closed during peak pollution hours'
          ],
          sensitive_groups: [
            'People with respiratory conditions should stay indoors',
            'Children and elderly should avoid outdoor activities'
          ],
          outdoor_activities: 'limited',
          mask_recommendation: 'recommended'
        },
        optimal_times: {
          optimal_days: [
            { date: '2024-01-16', aqi_forecast: 89, category: 'Moderate', recommendation: 'Good for light activities' },
            { date: '2024-01-17', aqi_forecast: 76, category: 'Moderate', recommendation: 'Suitable for outdoor activities' }
          ],
          best_day: { date: '2024-01-17', aqi_forecast: 76, category: 'Moderate', recommendation: 'Best day this week' },
          total_good_days: 2
        },
        trends: {
          current_aqi: 156,
          trend_direction: 'stable',
          avg_forecast: 145,
          improvement_expected: true
        },
        grap_recommendations: {
          stage: 'Stage I - Poor',
          recommended_actions: [
            'Implement dust control measures at construction sites',
            'Increase frequency of road cleaning',
            'Monitor industrial emissions'
          ],
          emergency_level: 'medium'
        }
      };
      
      setWardData(mockData);
      setError(null);
      
    } catch (err) {
      console.error('Error fetching ward data:', err);
      setError('Unable to load ward information');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (category: string) => {
    switch (category) {
      case "GOOD": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "MODERATE": return "bg-yellow-50 text-yellow-600 border-yellow-100";
      case "UNHEALTHY_SENSITIVE": return "bg-orange-50 text-orange-600 border-orange-100";
      case "UNHEALTHY": return "bg-red-50 text-red-600 border-red-100";
      case "VERY_UNHEALTHY": return "bg-purple-50 text-purple-600 border-purple-100";
      case "HAZARDOUS": return "bg-gray-50 text-gray-600 border-gray-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading ward analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !wardData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-medium mb-4">{error || 'Ward not found'}</p>
          <Link href="/citizen" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const pollutantData = Object.entries(wardData.current_status.pollutant_levels)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name: name.toUpperCase(), value }));

  const sourceData = Object.entries(wardData.pollution_sources).map(([name, data]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value: data.contribution_percentage,
    confidence: data.confidence
  }));

  return (
    <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/citizen" className="p-2 hover:bg-white rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{wardData.ward_info.ward_name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Ward #{wardData.ward_info.ward_number} • {wardData.ward_info.zone}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Updated {new Date(wardData.ward_info.last_updated).toLocaleString()}
              </span>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg border font-semibold text-sm ${getSeverityColor(wardData.current_status.category.category)}`}>
            {wardData.current_status.category.level}
          </div>
        </motion.div>

        {/* Alert Banner */}
        {wardData.current_status.aqi > 200 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700"
          >
            <AlertTriangle size={20} className="flex-shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Health Alert:</span> Air quality is unhealthy. 
              {wardData.health_recommendations.mask_recommendation === 'required' && ' Masks are required when going outside.'}
            </div>
          </motion.div>
        )}

        {/* Main Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Current AQI</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{wardData.current_status.aqi}</h3>
            <div className="flex items-center gap-2 mt-2">
              {wardData.trends.trend_direction === 'improving' ? (
                <TrendingDown className="w-4 h-4 text-green-600" />
              ) : wardData.trends.trend_direction === 'worsening' ? (
                <TrendingUp className="w-4 h-4 text-red-600" />
              ) : (
                <div className="w-4 h-4" />
              )}
              <span className={`text-sm font-medium ${
                wardData.trends.trend_direction === 'improving' ? 'text-green-600' : 
                wardData.trends.trend_direction === 'worsening' ? 'text-red-600' : 'text-slate-600'
              }`}>
                {wardData.trends.trend_direction}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Wind className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dominant</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{wardData.current_status.dominant_pollutant.toUpperCase()}</h3>
            <p className="text-sm text-slate-500 mt-2">
              {wardData.current_status.pollutant_levels[wardData.current_status.dominant_pollutant as keyof typeof wardData.current_status.pollutant_levels]} µg/m³
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mask Status</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 capitalize">
              {wardData.health_recommendations.mask_recommendation.replace('_', ' ')}
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Outdoor: {wardData.health_recommendations.outdoor_activities}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">GRAP Stage</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{wardData.grap_recommendations.stage}</h3>
            <p className="text-sm text-slate-500 mt-2 capitalize">
              {wardData.grap_recommendations.emergency_level} priority
            </p>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pollutant Levels Chart */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Pollutant Levels</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pollutantData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pollution Sources Chart */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Pollution Sources</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Health Recommendations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 mb-8"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Health Recommendations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-4">General Population</h4>
              <div className="space-y-3">
                {wardData.health_recommendations.general.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-blue-900 font-medium">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-4">Sensitive Groups</h4>
              <div className="space-y-3">
                {wardData.health_recommendations.sensitive_groups.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      ⚠️
                    </div>
                    <p className="text-sm text-orange-900 font-medium">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* GRAP Actions & Optimal Times */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GRAP Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              GRAP Actions Required
            </h3>
            <div className="space-y-3">
              {wardData.grap_recommendations.recommended_actions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-red-900 font-medium">{action}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Optimal Times */}
          {wardData.optimal_times.optimal_days.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Best Days Ahead
              </h3>
              <div className="space-y-3">
                {wardData.optimal_times.optimal_days.slice(0, 5).map((day, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-green-900">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-green-600">{day.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-700">{day.aqi_forecast}</span>
                      <p className="text-xs text-green-600">AQI</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
                <p className="text-sm font-medium text-green-800">
                  {wardData.optimal_times.total_good_days} good days in forecast
                </p>
              </div>
            </motion.div>
          )}
        </div>
    </div>
  );
}