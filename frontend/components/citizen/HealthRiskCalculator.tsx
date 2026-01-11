"use client";

import { useState } from 'react';
import { Heart, Activity, AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserProfile {
  age: number;
  conditions: string[];
  activityLevel: 'sedentary' | 'moderate' | 'active';
  outdoorHours: number;
}

interface HealthRiskCalculatorProps {
  currentAQI: number;
  pollutants: Array<{ name: string; value: number; unit: string }>;
}

export default function HealthRiskCalculator({ currentAQI, pollutants }: HealthRiskCalculatorProps) {
  const [profile, setProfile] = useState<UserProfile>({
    age: 30,
    conditions: [],
    activityLevel: 'moderate',
    outdoorHours: 2
  });
  const [showResults, setShowResults] = useState(false);

  const calculateHealthRisk = () => {
    let riskScore = 0;
    
    // Base risk from AQI (0-100 scale)
    if (currentAQI > 300) riskScore += 100;
    else if (currentAQI > 200) riskScore += 70;
    else if (currentAQI > 100) riskScore += 40;
    else if (currentAQI > 50) riskScore += 20;
    else riskScore += 5;
    
    // Age multiplier
    if (profile.age < 12 || profile.age > 65) riskScore *= 1.5;
    else if (profile.age < 18 || profile.age > 55) riskScore *= 1.2;
    
    // Conditions multiplier
    riskScore *= (1 + profile.conditions.length * 0.3);
    
    // Activity multiplier
    if (profile.activityLevel === 'active') riskScore *= 1.3;
    else if (profile.activityLevel === 'sedentary') riskScore *= 0.9;
    
    // Outdoor hours multiplier
    riskScore *= (1 + (profile.outdoorHours / 10));
    
    // Determine risk level
    const riskLevel = riskScore > 150 ? 'severe' :
                      riskScore > 100 ? 'high' :
                      riskScore > 50 ? 'medium' : 'low';
    
    // Generate recommendations
    const recommendations = generateRecommendations(riskLevel, profile, currentAQI);
    
    // Find safe time windows (mock data - in real app would use hourly AQI)
    const safeTimeWindows = findSafeTimeWindows(currentAQI);
    
    return { riskLevel, riskScore: Math.round(riskScore), recommendations, safeTimeWindows };
  };

  const generateRecommendations = (riskLevel: string, profile: UserProfile, aqi: number) => {
    const recs = {
      immediate: [] as string[],
      protective: [] as string[],
      lifestyle: [] as string[]
    };

    if (riskLevel === 'severe' || riskLevel === 'high') {
      recs.immediate.push('Avoid ALL outdoor activities');
      recs.immediate.push('Keep windows and doors closed');
      recs.immediate.push('Use air purifiers indoors');
      recs.protective.push('Wear N95/N99 masks if you must go outside');
      recs.protective.push('Limit physical exertion');
      if (profile.conditions.length > 0) {
        recs.immediate.push('Keep emergency medications readily available');
      }
    } else if (riskLevel === 'medium') {
      recs.immediate.push('Limit prolonged outdoor activities');
      recs.immediate.push('Reduce strenuous exercise outdoors');
      recs.protective.push('Consider wearing masks during peak pollution hours');
      recs.lifestyle.push('Monitor symptoms closely');
    } else {
      recs.immediate.push('Normal outdoor activities are safe');
      recs.protective.push('Stay hydrated');
      recs.lifestyle.push('Continue regular exercise routine');
    }

    // Add condition-specific recommendations
    if (profile.conditions.includes('asthma')) {
      recs.protective.push('Keep inhaler accessible at all times');
      recs.lifestyle.push('Avoid areas with heavy traffic');
    }
    if (profile.conditions.includes('heart_disease')) {
      recs.protective.push('Monitor heart rate during any outdoor activity');
      recs.lifestyle.push('Consult doctor before outdoor exercise');
    }

    return recs;
  };

  const findSafeTimeWindows = (aqi: number) => {
    // In a real app, this would analyze hourly AQI data
    // For now, providing general guidance
    if (aqi > 200) {
      return ['Early morning (5-7 AM) may have slightly better air quality'];
    } else if (aqi > 100) {
      return ['Early morning (5-8 AM)', 'Late evening (8-10 PM)'];
    } else {
      return ['All day - air quality is acceptable'];
    }
  };

  const results = showResults ? calculateHealthRisk() : null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'severe': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'medium': return <AlertTriangle className="w-8 h-8 text-yellow-600" />;
      case 'high': return <AlertTriangle className="w-8 h-8 text-orange-600" />;
      case 'severe': return <AlertTriangle className="w-8 h-8 text-red-600" />;
      default: return <Activity className="w-8 h-8 text-gray-600" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-6 shadow-xl border-2 border-purple-100"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500 rounded-2xl">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900">Personal Health Risk Calculator</h3>
          <p className="text-sm text-slate-500 font-medium">Get personalized air quality recommendations</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="space-y-4 mb-6">
        {/* Age */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Age</label>
          <input
            type="number"
            value={profile.age}
            onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none font-semibold"
            min="1"
            max="120"
          />
        </div>

        {/* Health Conditions */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Health Conditions</label>
          <div className="grid grid-cols-2 gap-2">
            {['asthma', 'heart_disease', 'copd', 'diabetes'].map((condition) => (
              <label key={condition} className="flex items-center gap-2 p-3 bg-white rounded-xl border-2 border-slate-200 cursor-pointer hover:border-purple-300 transition-colors">
                <input
                  type="checkbox"
                  checked={profile.conditions.includes(condition)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setProfile({ ...profile, conditions: [...profile.conditions, condition] });
                    } else {
                      setProfile({ ...profile, conditions: profile.conditions.filter(c => c !== condition) });
                    }
                  }}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm font-semibold capitalize">{condition.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Activity Level</label>
          <div className="grid grid-cols-3 gap-2">
            {(['sedentary', 'moderate', 'active'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setProfile({ ...profile, activityLevel: level })}
                className={`px-4 py-3 rounded-xl font-bold capitalize transition-all ${
                  profile.activityLevel === level
                    ? 'bg-purple-500 text-white shadow-lg scale-105'
                    : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-purple-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Outdoor Hours */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Daily Outdoor Hours: <span className="text-purple-600">{profile.outdoorHours}h</span>
          </label>
          <input
            type="range"
            value={profile.outdoorHours}
            onChange={(e) => setProfile({ ...profile, outdoorHours: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
            min="0"
            max="12"
            step="1"
          />
          <div className="flex justify-between text-xs text-slate-500 font-semibold mt-1">
            <span>0h</span>
            <span>6h</span>
            <span>12h</span>
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={() => setShowResults(true)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black py-4 rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
        >
          Calculate My Risk
        </button>
      </div>

      {/* Results */}
      {showResults && results && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Risk Level */}
          <div className={`p-6 rounded-2xl border-2 ${getRiskColor(results.riskLevel)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getRiskIcon(results.riskLevel)}
                <div>
                  <h4 className="text-xl font-black capitalize">{results.riskLevel} Risk</h4>
                  <p className="text-sm font-semibold">Risk Score: {results.riskScore}/200</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black">{Math.round((results.riskScore / 200) * 100)}%</p>
                <p className="text-xs font-bold">Health Impact</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl p-5 border-2 border-slate-200">
            <h4 className="font-black text-slate-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Immediate Actions
            </h4>
            <ul className="space-y-2">
              {results.recommendations.immediate.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-purple-600 font-bold">•</span>
                  <span className="font-semibold text-slate-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-slate-200">
            <h4 className="font-black text-slate-900 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Protective Measures
            </h4>
            <ul className="space-y-2">
              {results.recommendations.protective.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-purple-600 font-bold">•</span>
                  <span className="font-semibold text-slate-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Safe Time Windows */}
          <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-200">
            <h4 className="font-black text-blue-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Best Times for Outdoor Activities
            </h4>
            <ul className="space-y-2">
              {results.safeTimeWindows.map((window, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 font-bold">•</span>
                  <span className="font-semibold text-blue-800">{window}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
